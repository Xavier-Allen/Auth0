let auth0 = null;


const fetchAuthConfig = () => fetch("/auth_config.json");

window.onload = async () => {
    await configureClient();  
    // NEW - update the UI state
    updateUI();

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
      // show the gated content
      return;
    }

    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
  
      // Process the login state
      await auth0.handleRedirectCallback();
      
      updateUI();
  
      // Use replaceState to redirect the user away and remove the querystring parameters
      window.history.replaceState({}, document.title, "/");
    }
  };
  
  
 // ...

const updateUI = async () => { 
    const isAuthenticated = await auth0.isAuthenticated();
  
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
    document.getElementById("btn-call-api").disabled = !isAuthenticated;
    document.getElementById("btn-call-mgtapi").disabled =!isAuthenticated;
    // NEW - add logic to show/hide gated content after authentication
    if (isAuthenticated) {
      document.getElementById("gated-content").classList.remove("hidden");
  
      document.getElementById(
        "ipt-access-token"
      ).innerHTML = await auth0.getTokenSilently();
  
      document.getElementById("ipt-user-profile").textContent = JSON.stringify(
        await auth0.getUser()
      );
  
    } else {
      document.getElementById("gated-content").classList.add("hidden");
    }
  };
  
  // ..
  // ..
  
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();
  
    auth0 = await createAuth0Client({
      domain: config.domain,
      client_id: config.clientId,
      audience: config.audience,
      scope: 'read:tester read:clients',
      token_dialect: 'access_token_authz',
      advancedOptions: {
        defaultScope: 'email read:tester read:clients' // change the scopes that are applied to every authz request. **Note**: `openid` is always specified regardless of this setting
      }
    });
  };

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
const login = async () => {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin,
      scope: ["read:tester", "read:actions", "read:clients"],
    });
  };

const logout = () => {
    auth0.logout({
      returnTo: window.location.origin
    });
  };

  const callApi = async () => {
    try {
  
      // Get the access token from the Auth0 client
      const token = await auth0.getTokenSilently();
  
      // Make the call to the API, setting the token
      // in the Authorization header
      const response = await fetch("/api/private", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Fetch the JSON result
      const responseData = await response.json();
  
      // Display the result in the output element
      const responseElement = document.getElementById("api-call-result");
  
      responseElement.innerText = JSON.stringify(responseData, {}, 2);
  
  } catch (e) {
      console.error(e);
    }
  };

  const callManagementApi = async () => {
    try {
  
      const token = await auth0.getTokenSilently();
      const response = await fetch("/api/private-scoped", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      // Fetch the JSON result
      const responseData = await response.json();
      const responseElement = document.getElementById("api-call-result");
  
      responseElement.innerText = JSON.stringify(responseData, {}, 2);
  
  } catch (e) {
      console.error(e);
    }
  };

  function testCall() {
    console.log('THIS WOOOOOORKED');
  }
