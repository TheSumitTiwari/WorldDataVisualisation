import dash
from dash import dcc, html, Input, Output
import dash_cytoscape as cyto
import pandas as pd

# Sample DataFrame with multiple upstream and downstream connections
data = {
    'ait_name': ['AIT1', 'AIT2', 'AIT3', 'AIT4'],
    'id': ['1', '2', '3', '4'],
    'upstream': [['2', '3'], ['3'], ['1'], []],       # Multiple upstream connections
    'downstream': [['2'], ['1', '3'], ['1'], ['2']],  # Multiple downstream connections
    'risk_factor': [3, 2, 5, 4],
    'recovery_time': ['tier 1', 'tier 2', 'tier 3', 'tier 1'],
    'business_name': ['Business A', 'Business B', 'Business A', 'Business C'],
    'status': ['online', 'offline', 'online', 'offline']  # New 'status' column
}
df = pd.DataFrame(data)

# Function to generate Cytoscape elements with different classes for filtered and connected nodes
def generate_elements(dataframe, filtered_ids, connected_ids):
    elements = []
    valid_ids = set(dataframe['id'])

    for _, row in dataframe.iterrows():
        node_class = (
            'filtered' if row['id'] in filtered_ids else
            'connected' if row['id'] in connected_ids else
            'default'
        )
        status_class = 'online' if row['status'] == 'online' else 'offline'
        elements.append({
            'data': {'id': row['id'], 'label': row['ait_name']},
            'classes': f"{node_class} {status_class}"
        })
    
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

    # Summary Boxes
    html.Div(
        id='summary-boxes',
        style={'display': 'flex', 'justifyContent': 'space-around', 'padding': '10px'},
        children=[
            html.Div(id='total-nodes', className='summary-box', style={'padding': '10px', 'border': '1px solid #333', 'border-radius': '5px'}),
            html.Div(id='filtered-nodes', className='summary-box', style={'padding': '10px', 'border': '1px solid #333', 'border-radius': '5px'}),
            html.Div(id='online-nodes', className='summary-box', style={'padding': '10px', 'border': '1px solid #333', 'border-radius': '5px'}),
            html.Div(id='offline-nodes', className='summary-box', style={'padding': '10px', 'border': '1px solid #333', 'border-radius': '5px'}),
        ]
    ),

    html.Div(
        style={'display': 'flex', 'flexDirection': 'row', 'alignItems': 'flex-start'},
        children=[
            html.Div(style={'flex': '1', 'padding': '10px'}, children=[
                html.Span("AIT Name:"),
                dcc.Dropdown(
                    id='ait-name-filter',
                    options=[{'label': ait_name, 'value': ait_name} for ait_name in df['ait_name'].unique()],
                    placeholder="Enter AIT name",
                    multi=False,
                    searchable=True,
                    value='all'
                ),
                html.Br(), html.Br(),
                html.Span("Risk Factor:"),
                dcc.Dropdown(id='risk-filter', options=[
                    {'label': 'All', 'value': 'all'}
                ] + [{'label': f'Risk {i}', 'value': i} for i in sorted(df['risk_factor'].unique())],
                placeholder="Select risk factor", multi=False, value='all'),
                
                html.Br(), html.Span("Recovery Time:"),
                dcc.Dropdown(id='recovery-filter', options=[
                    {'label': 'All', 'value': 'all'}
                ] + [{'label': tier, 'value': tier} for tier in sorted(df['recovery_time'].unique())],
                placeholder="Select recovery time", multi=False, value='all'),
                
                html.Br(), html.Span("Business Name:"),
                dcc.Dropdown(id='business-filter', options=[
                    {'label': 'All', 'value': 'all'}
                ] + [{'label': name, 'value': name} for name in sorted(df['business_name'].unique())],
                placeholder="Select business name", multi=False, value='all'),
            ]),
            
            html.Div(
                style={'flex': '2', 'padding': '10px'},
                children=[
                    cyto.Cytoscape(
                        id='cytoscape',
                        elements=generate_elements(df, set(), set()),
                        style={'width': '100%', 'height': '500px', 'position': 'relative'},
                        layout={'name': 'cose'},
                        stylesheet=[
                            {'selector': '.filtered.online', 'style': {'background-color': 'blue', 'label': 'data(label)'}},
                            {'selector': '.filtered.offline', 'style': {'background-color': 'purple', 'label': 'data(label)'}},
                            {'selector': '.connected.online', 'style': {'background-color': 'lightgreen', 'label': 'data(label)'}},
                            {'selector': '.connected.offline', 'style': {'background-color': 'lightcoral', 'label': 'data(label)'}},
                            {'selector': '.default.online', 'style': {'background-color': 'green', 'label': 'data(label)'}},
                            {'selector': '.default.offline', 'style': {'background-color': 'red', 'label': 'data(label)'}}
                        ]
                    )
                ]
            ),
            
            html.Div(style={'flex': '1', 'padding': '10px'}, children=[
                html.H3("Node Details"),
                html.Div(id='node-details')  # This will display the selected node's details
            ])
        ]
    ),
    
    dcc.Store(id='selected-node-id')
])

# Callback to update the summary boxes based on filters
@app.callback(
    Output('total-nodes', 'children'),
    Output('filtered-nodes', 'children'),
    Output('online-nodes', 'children'),
    Output('offline-nodes', 'children'),
    Input('ait-name-filter', 'value'),
    Input('risk-filter', 'value'),
    Input('recovery-filter', 'value'),
    Input('business-filter', 'value')
)
def update_summary_boxes(ait_filter, risk_filter, recovery_filter, business_filter):
    filtered_df = df
    if ait_filter and ait_filter != 'all':
        filtered_df = filtered_df[filtered_df['ait_name'] == ait_filter]
    if risk_filter and risk_filter != 'all':
        filtered_df = filtered_df[filtered_df['risk_factor'] == int(risk_filter)]
    if recovery_filter and recovery_filter != 'all':
        filtered_df = filtered_df[filtered_df['recovery_time'] == recovery_filter]
    if business_filter and business_filter != 'all':
        filtered_df = filtered_df[filtered_df['business_name'] == business_filter]
    
    total_nodes = len(df)
    filtered_nodes = len(filtered_df)
    online_nodes = len(filtered_df[filtered_df['status'] == 'online'])
    offline_nodes = len(filtered_df[filtered_df['status'] == 'offline'])
    
    return (
        f"Total Nodes: {total_nodes}",
        f"Filtered Nodes: {filtered_nodes}",
        f"Online Nodes: {online_nodes}",
        f"Offline Nodes: {offline_nodes}"
    )

if __name__ == '__main__':
    app.run_server(debug=True)
