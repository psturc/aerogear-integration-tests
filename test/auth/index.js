require('chai').should();

const { prepareKeycloak, resetKeycloakConfiguration } = require('../../util/keycloak');
const mobileServices = require('../../config/mobile-services');

describe('Auth', function() {

  this.timeout(0);

  let mainWindow;

  before('setup test realm', async function() {
    mainWindow = await client.getWindowHandle();
    const config = mobileServices.services.find(service => service.name === 'keycloak');
    await prepareKeycloak(config.url)
  });

  after('remove test realm', async function() {
    await client.switchToWindow(mainWindow);
    await resetKeycloakConfiguration();
  });

  it('should not login with incorrect credentials', async function() {
    client.execute(() => {
      const { agAuth: { Auth }, app } = window.aerogear;

      const authService = new Auth(app.config);
      window.aerogear.authService = authService;

      const initOptions = { onLoad: 'login-required' };
      authService.init(initOptions);
    });

    await new Promise(resolve => setTimeout(resolve, 20 * 1000));

    const allWindows = await client.getWindowHandles();
    const loginPage = allWindows.find(w => w !== mainWindow);
    await client.switchToWindow(loginPage);

    const usernamEl = await client.$('#username');
    await usernamEl.setValue('test');
    
    const passwordEl = await client.$('#password');
    await passwordEl.setValue('wrong-password');
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const loginEl = await client.$('#kc-login');
    await loginEl.click();

    await new Promise(resolve => setTimeout(resolve, 3000));

    const alertEl = await client.$('.alert-error');
    (await alertEl.isDisplayed()).should.equal(true);
  });
  
  it('should login', async function() {
    const passwordEl = await client.$('#password');
    await passwordEl.setValue('123');
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const loginEl = await client.$('#kc-login');
    await loginEl.click();

    await client.switchToWindow(mainWindow);

    await new Promise(resolve => setTimeout(resolve, 5000));

    const authenticated = await client.executeAsync(async done => {
      const { authService } = window.aerogear;

      done(authService.isAuthenticated());
    });

    authenticated.should.equal(true);
  });

  it('should refresh authentication token', async function() {
    const authenticated = await client.executeAsync(async done => {
      const { authService } = window.aerogear;

      await authService.extract().updateToken(30);

      done(authService.isAuthenticated());
    });

    authenticated.should.equal(true);
  });

  it('should get authentication token', function() {
    client.execute(() => {
      const { authService } = window.aerogear;

      authService.extract().token;
    });
  });

  it('should get realm roles', async function() {
    const result = await client.executeAsync(async done => {
      const { authService } = window.aerogear;

      done(authService.getRealmRoles());
    });

    result.should.deep.equal(['offline_access', 'uma_authorization']);
  });

  it('should logout', async function() {
    const authenticated = await client.executeAsync(async done => {
      const { authService } = window.aerogear;

      await authService.logout();

      done(authService.isAuthenticated());
    });

    authenticated.should.equal(false);
  });
});
