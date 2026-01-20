import React, { Component } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@material-ui/core';
import {
  Menu,
  Dashboard,
  Settings,
  Palette
} from '@material-ui/icons';
// Suppress Material-UI deprecation warnings
console.error = (() => {
  const originalError = console.error;
  return function(...args) {
    if (args[0] && args[0].includes && args[0].includes('componentWillMount')) {
      return; // Suppress Material-UI componentWillMount warnings
    }
    return originalError.apply(console, args);
  };
})();


class MyApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }

  handleDrawerToggle = () => {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  };

  render() {
    const { Component, pageProps } = this.props;
    const { drawerOpen } = this.state;

    const menuItems = [
      { text: 'Dashboard', icon: <Dashboard />, href: '/dashboard' },
      { text: 'UI Components', icon: <Palette />, href: '/ui-components' },
      { text: 'UI Component', icon: <Settings />, href: '/ui-component' },
      { text: 'Enhanced', icon: <Settings />, href: '/enhanced' }
    ];

    return (
      <div style={{ flexGrow: 1, zIndex: 1, position: 'relative', display: 'flex' }}>
        <AppBar position="fixed" style={{ zIndex: 1200, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>
          <Toolbar style={{ paddingRight: 24, minHeight: 64 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerToggle}
              style={{ marginRight: 20, color: 'white' }}
            >
              <Menu />
            </IconButton>
            <Typography variant="title" color="inherit" noWrap>
              Microservices Platform
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={this.handleDrawerToggle}
          style={{ width: 240 }}
          ModalProps={{
            keepMounted: true
          }}
        >
          <div style={{ width: 240, padding: '20px' }}>
            <List>
              {menuItems.map((item, index) => (
                <a href={item.href} key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItem button>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                </a>
              ))}
            </List>
          </div>
        </Drawer>

        <main style={{ flexGrow: 1, backgroundColor: '#f5f5f5', padding: '0px', minHeight: '100vh' }}>
          <div style={{ padding: '20px' }}>
            <Component {...pageProps} />
          </div>
        </main>
      </div>
    );
  }
}

export default MyApp;
