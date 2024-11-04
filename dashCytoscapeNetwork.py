import dash
from dash import dcc, html, Input, Output
import dash_cytoscape as cyto
import pandas as pd
import random


def generate_ait_data(num_ait):
    # Initialize lists to store each column's data
    ait_names = [f"AIT{i+1}" for i in range(num_ait)]
    ids = list(range(1, num_ait + 1))
    upstream_list = []
    downstream_list = []
    risk_factors = [random.randint(1, 5) for _ in range(num_ait)]
    recovery_times = [f"tier {random.randint(1, 6)}" for _ in range(num_ait)]
    business_names = [f"Business {chr(65 + i)}" for i in range(num_ait)]

    # Generate upstream and downstream connections ensuring no overlaps
    for i in range(num_ait):
        available_nodes = list(set(ids) - {ids[i]})  # Exclude the current node to avoid self-loop
        if available_nodes:
            upstream = random.sample(available_nodes, min(3, len(available_nodes)))
        else:
            upstream = []
        
        # Ensure downstream does not have common elements with upstream
        remaining_nodes = list(set(available_nodes) - set(upstream))
        if remaining_nodes:
            downstream = random.sample(remaining_nodes, min(3, len(remaining_nodes)))
        else:
            downstream = []
        
        upstream_list.append(upstream)
        downstream_list.append(downstream)
    
    # Create a DataFrame
    data = {
        "ait_name": ait_names,
        "id": ids,
        "upstream": upstream_list,
        "downstream": downstream_list,
        "risk_factor": risk_factors,
        "recovery_time": recovery_times,
        "business_name": business_names
    }
    
    df = pd.DataFrame(data)
    return df

# Example usage
df = generate_ait_data(1000)


# Sample DataFrame with multiple upstream and downstream connections
# data = {
#     'ait_name': ['AIT1', 'AIT2', 'AIT3', 'AIT4'],
#     'id': ['1', '2', '3', '4'],
#     'upstream': [['2', '3'], ['3'], ['1'], []],       # Multiple upstream connections
#     'downstream': [['2'], ['1', '3'], ['1'], ['2']],  # Multiple downstream connections
#     'risk_factor': [3, 2, 5, 4],
#     'recovery_time': ['tier 1', 'tier 2', 'tier 3', 'tier 1'],
#     'business_name': ['Business A', 'Business B', 'Business A', 'Business C']
# }
# df = pd.DataFrame(data)

# Function to generate Cytoscape elements with different classes for filtered and connected nodes
def generate_elements(dataframe, filtered_ids, connected_ids):
    elements = []
    valid_ids = set(dataframe['id'])

    # Add nodes with different colors based on filtered or connected status
    for _, row in dataframe.iterrows():
        node_class = 'filtered' if row['id'] in filtered_ids else 'connected' if row['id'] in connected_ids else 'default'
        elements.append({'data': {'id': row['id'], 'label': row['ait_name']}, 'classes': node_class})
    
    # Add edges for upstream and downstream connections
    for _, row in dataframe.iterrows():
        for upstream_id in row['upstream']:
            if upstream_id in valid_ids:
                elements.append({'data': {'source': upstream_id, 'target': row['id']}})
        for downstream_id in row['downstream']:
            if downstream_id in valid_ids:
                elements.append({'data': {'source': row['id'], 'target': downstream_id}})
    
    return elements

# Initialize Dash app
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("AIT Network Graph"),
    html.Div(
        style={'display': 'flex', 'flexDirection': 'row', 'alignItems': 'flex-start'},  # Flexbox for side-by-side layout
        children=[
            # Left column for filters
            html.Div(style={'flex': '1', 'padding': '10px'}, children=[
                dcc.Dropdown(id='risk-filter', options=[
                    {'label': 'All', 'value': 'all'}
                ] + [{'label': f'Risk {i}', 'value': i} for i in sorted(df['risk_factor'].unique())],
                placeholder="Select risk factor", multi=False, value='all'),
                
                dcc.Dropdown(id='recovery-filter', options=[
                    {'label': 'All', 'value': 'all'}
                ] + [{'label': tier, 'value': tier} for tier in sorted(df['recovery_time'].unique())],
                placeholder="Select recovery time", multi=False, value='all'),
                
                dcc.Dropdown(id='business-filter', options=[
                    {'label': 'All', 'value': 'all'}
                ] + [{'label': name, 'value': name} for name in sorted(df['business_name'].unique())],
                placeholder="Select business name", multi=False, value='all'),
            ]),
            
            # Right column for Cytoscape graph
            html.Div(
                style={'flex': '2', 'padding': '10px'},  # More space for the graph
                children=[
                    cyto.Cytoscape(
                        id='cytoscape',
                        elements=generate_elements(df, set(), set()),
                        style={'width': '100%', 'height': '100vh', 'position': 'relative'},
                        layout={'name': 'cose'},
                        # useWebGL=True,        
                        stylesheet=[
                            {'selector': '.filtered', 'style': {'background-color': 'green', 'label': 'data(label)'}},
                            {'selector': '.connected', 'style': {'background-color': 'gray', 'label': 'data(label)'}},
                            {'selector': '.default', 'style': {'background-color': 'gray', 'label': 'data(label)'}},
                            {
                                'selector': 'node',
                                'style': {
                                    'width': 5,               # Reduce node size
                                    'height': 5,
                                    'label': 'data(label)',
                                    'font-size': '6px'         # Smaller font sizes for labels
                                }
                            },
                            {
                                'selector': 'edge',
                                'style': {
                                    'width': 1,                # Thinner edge lines
                                    'line-color': '#ccc'
                                }
                            }
                        ]
                    )
                ]
            )
        ]
    )
])

# Callback to update graph based on filters
@app.callback(
    Output('cytoscape', 'elements'),
    [Input('risk-filter', 'value'),
     Input('recovery-filter', 'value'),
     Input('business-filter', 'value')]
)
def update_graph(risk, recovery, business):
    # Start with the full dataset
    filtered_data = df.copy()
    
    # Apply filters one by one to ensure AND condition
    if risk != 'all':
        filtered_data = filtered_data[filtered_data['risk_factor'] == risk]
    if recovery != 'all':
        filtered_data = filtered_data[filtered_data['recovery_time'] == recovery]
    if business != 'all':
        filtered_data = filtered_data[filtered_data['business_name'] == business]

    # Collect all connected nodes (upstream and downstream)
    filtered_ids = set(filtered_data['id'])
    connected_ids = set()
    for _, row in filtered_data.iterrows():
        connected_ids.update(row['upstream'])
        connected_ids.update(row['downstream'])
    
    # Filter the original DataFrame to include all nodes in connected_ids
    connected_data = df[df['id'].isin(connected_ids)]
    
    # Generate elements for Cytoscape based on connected data
    return generate_elements(connected_data, filtered_ids, connected_ids)

if __name__ == '__main__':
    app.run_server(debug=True)
