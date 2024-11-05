from dash import html, dcc, Input, Output, callback
import dash_cytoscape as cyto
import pandas as pd
import dash

# Register the page
dash.register_page(__name__)

# Sample data
data = {
    'id': ['1', '2', '3'],
    'label': ['Node 1', 'Node 2', 'Node 3'],
    'connections': [['2'], ['1', '3'], ['2']]
}
df = pd.DataFrame(data)

def generate_elements():
    elements = [{'data': {'id': row['id'], 'label': row['label']}} for _, row in df.iterrows()]
    for i, row in df.iterrows():
        for target in row['connections']:
            elements.append({'data': {'source': row['id'], 'target': target}})
    return elements

# Define the layout
layout = html.Div([
    html.H3("Page 1 - Cytoscape Graph"),
    cyto.Cytoscape(
        id='cytoscape-graph',
        elements=generate_elements(),
        layout={'name': 'cose'},
        style={'width': '100%', 'height': '500px'}
    ),
    html.Div(id='node-click-output')  # Display node click data here
])

# Define callback for node clicks
@callback(
    Output('node-click-output', 'children'),
    Input('cytoscape-graph', 'tapNodeData')
)
def display_node_data(data):
    if data:
        return f"Node clicked: {data['label']}"
    return "Click on a node to see details."
