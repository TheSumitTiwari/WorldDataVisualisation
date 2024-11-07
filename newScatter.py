from dash import dcc, html
import plotly.graph_objects as go
import pandas as pd
import dash_bootstrap_components as dbc

# Sample data with 'status' and 'label' columns
data = {
    'x': [1, 2, 3, 4, 5],
    'y': [10, 15, 13, 17, 9],
    'z': [5, 6, 7, 8, 4],
    'label': ['A', 'B', 'C', 'D', 'E'],
    'status': ['up', 'down', 'pending', 'down', 'up']  # Status values
}
df = pd.DataFrame(data)

# Define color mapping for status
status_colors = {
    'up': 'red',
    'down': 'green',
    'pending': 'orange'  # Amber color
}

# Function to create a 3D scatter plot with status-based coloring and labels on hover
def create_scatter_plot_with_lines(data, title):
    # Scatter plot traces for each status to generate a legend
    scatter_traces = []
    for status in status_colors.keys():
        status_data = data[data['status'] == status]
        scatter_trace = go.Scatter3d(
            x=status_data['x'],
            y=status_data['y'],
            z=status_data['z'],
            mode='markers',
            name=f"Status: {status.capitalize()}",  # Legend label
            marker=dict(size=5, color=status_colors[status]),
            text=status_data['label'],
            hovertemplate="Label: %{text}<br>X: %{x}<br>Y: %{y}<br>Z: %{z}<br>Status: " + status.capitalize() + "<extra></extra>",
            showlegend=True
        )
        scatter_traces.append(scatter_trace)

    # Line traces for each point connecting to Z-axis
    line_traces = []
    for i in range(len(data)):
        line_trace = go.Scatter3d(
            x=[data['x'].iloc[i], data['x'].iloc[i]],
            y=[data['y'].iloc[i], data['y'].iloc[i]],
            z=[0, data['z'].iloc[i]],  # Line from z=0 to the point's z value
            mode='lines',
            line=dict(color='gray', width=2),
            showlegend=False  # Don't show lines in the legend
        )
        line_traces.append(line_trace)

    # Combine all traces into the figure
    fig = go.Figure(data=scatter_traces + line_traces)
    fig.update_layout(
        title=title,
        margin=dict(l=0, r=0, t=30, b=0),
        scene=dict(zaxis_title='Z Axis')
    )
    return dcc.Graph(figure=fig, style={'height': '400px'})

# Layout with a single scatter plot
layout = dbc.Container(fluid=True, children=[
    html.H2("3D Scatter Plot with Lines to Z-axis and Status-Based Coloring"),
    create_scatter_plot_with_lines(df, "3D Scatter with Z-Axis Lines and Status Coloring")
])
