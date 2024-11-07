dbc.Navbar(
        dbc.Container([
            dbc.NavbarBrand(
                html.Img(src="your_logo_url", height="40px"),  # Replace with your actual logo URL
                className="ms-2"  # Adds slight spacing on the left
            )
        ]),
        color="dark",
        dark=True,
        className="mb-4"
    ),
