export const environment = {
  production: true,
  apiUrl: 'https://your-propertyhub-api.com/api',
  appName: 'PropertyHub Angular',
  version: '1.0.0',
  jwtTokenKey: 'PropertyHubAuthToken',
  customerTokenKey: 'PropertyHubCustomerToken',
  storageKeys: {
    userProfile: 'PropertyHubUserProfile',
    customerProfile: 'PropertyHubCustomerProfile',
    preferences: 'PropertyHubPreferences'
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100]
  },
  toast: {
    timeOut: 5000,
    enableHtml: true,
    positionClass: 'toast-bottom-right'
  }
};