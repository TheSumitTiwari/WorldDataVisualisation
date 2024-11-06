import dash
from dash import dcc, html, Input, Output
import dash_cytoscape as cyto
import pandas as pd
import ast

# Sample DataFrame with multiple upstream and downstream connections
data = {
    'ait_name': ['AIT1', 'AIT2', 'AIT3', 'AIT4'],
    'id': ['1', '2', '3', '4'],
    'upstream': [['2', '3'], ['3'], ['1'], []],       # Multiple upstream connections
    'downstream': [['2'], ['1', '3'], ['1'], ['2']],  # Multiple downstream connections
    'risk_factor': [3, 2, 5, 4],
    'recovery_time': ['tier 1', 'tier 2', 'tier 3', 'tier 1'],
    'business_name': ['Business A', 'Business B', 'Business A', 'Business C']
}
df = pd.DataFrame(data)

# Check for string-based lists and convert to lists if needed
df['upstream'] = df['upstream'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)
df['downstream'] = df['downstream'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)

# Function to generate Cytoscape elements with different classes for filtered and connected nodes
def generate_elements(dataframe, filtered_ids, connected_ids):
    elements = []
    valid_ids = set(dataframe['id'])
    unique_edges = set()  # Track unique edges as (source, target) tuples

    # Debugging output
    for _, row in dataframe.iterrows():
        print(f"Processing AIT: {row['ait_name']}, Upstream: {row['upstream']}")

    # Add nodes with different colors based on filtered or connected status
    for _, row in dataframe.iterrows():
        node_class = 'filtered' if row['id'] in filtered_ids else 'connected' if row['id'] in connected_ids else 'default'
        elements.append({'data': {'id': row['id'], 'label': row['ait_name']}, 'classes': node_class})
    
    # Add unique edges for upstream and downstream connections
    for _, row in dataframe.iterrows():
        for upstream_id in row['upstream']:
            if upstream_id in valid_ids and (upstream_id, row['id']) not in unique_edges:
                elements.append({'data': {'source': upstream_id, 'target': row['id']}})
                unique_edges.add((upstream_id, row['id']))
        for downstream_id in row['downstream']:
            if downstream_id in valid_ids and (row['id'], downstream_id) not in unique_edges:
                elements.append({'data': {'source': row['id'], 'target': downstream_id}})
                unique_edges.add((row['id'], downstream_id))
    
    return elements

# Initialize Dash app
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("AIT Network Graph"),
    cyto.Cytoscape(
        id='cytoscape',
        elements=generate_elements(df, set(), set()),
        style={'width': '100%', 'height': '500px', 'position': 'relative'},
        layout={'name': 'cose'},
        stylesheet=[
            {'selector': '.filtered.online', 'style': {'background-color': 'blue', 'label': 'data(label)'}},
            {'selector': '.filtered.offline', 'style': {'background-color': 'purple', 'label': 'data(label)'}},
            # Edge style with arrow and bezier curve
            {'selector': 'edge', 'style': {
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#9dbaea',
                'line-color': '#9dbaea',
                'curve-style': 'bezier'
            }},
        ]
    )
])

if __name__ == '__main__':
    app.run_server(debug=True)
