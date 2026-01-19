import React from 'react';

interface AppProps {
  Component: React.ComponentType<any>;
  pageProps: any;
}

class MyApp extends React.Component<AppProps> {
  render() {
    const { Component, pageProps } = this.props;
    return <Component {...pageProps} />;
  }
}

export default MyApp;
