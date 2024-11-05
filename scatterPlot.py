from dash import dcc, html, Input, Output, callback
import plotly.express as px
import pandas as pd

# Sample data
data = {
    'x': [1, 2, 3, 4, 5],
    'y': [10, 15, 13, 17, 9],
    'z': [5, 6, 7, 8, 4],
    'label': ['A', 'B', 'C', 'D', 'E']
}
df = pd.DataFrame(data)

# Create initial 3D scatter plot figure
fig = px.scatter_3d(df, x='x', y='y', z='z', color='label', title="3D Scatter Plot")

# Layout with filter dropdown and graph
layout = html.Div([
    html.H2("Interactive 3D Scatter Plot Page"),
    html.Label("Filter by Label:"),
    dcc.Dropdown(
        id='label-filter',
        options=[{'label': lbl, 'value': lbl} for lbl in df['label'].unique()],
        value=None,
        placeholder="Select a label"
    ),
    dcc.Graph(id='3d-scatter-plot', figure=fig),
    html.Div(id='click-data')
])

# Define callbacks directly within this module

# Update 3D scatter plot based on dropdown selection
@callback(
    Output('3d-scatter-plot', 'figure'),
    [Input('label-filter', 'value')]
)
def update_figure(selected_label):
    filtered_df = df if selected_label is None else df[df['label'] == selected_label]
    return px.scatter_3d(filtered_df, x='x', y='y', z='z', color='label', title="3D Scatter Plot")

# Display click data
@callback(
    Output('click-data', 'children'),
    [Input('3d-scatter-plot', 'clickData')]
)
def display_click_data(clickData):
    if clickData:
        point = clickData['points'][0]
        return f"Clicked on point with label: {point['text']}"
    return "Click on a point in the scatter plot."
