require('chai').should();

describe('Device Security', function() {
  it('should be possible to run `rooted` check', async function() {
    const result = await client.executeAsync(async done => {
      const { SecurityService, DeviceCheckType } = window.aerogear.agSecurity;
      const securityService = new SecurityService();
  
      const result = await securityService.check(DeviceCheckType.rootEnabled);
  
      done(result);
    });

    result.passed.should.equal(true);
  });

  it('should be possible to run `emulator` check', async function() {
    const result = await client.executeAsync(async done => {
      const { SecurityService, DeviceCheckType } = window.aerogear.agSecurity;
      const securityService = new SecurityService();
  
      const result = await securityService.check(DeviceCheckType.isEmulator);
  
      done(result);
    });

    result.passed.should.equal(false);
  });

  it('should be possible to run `debugMode` check', async function() {
    const result = await client.executeAsync(async done => {
      const { SecurityService, DeviceCheckType } = window.aerogear.agSecurity;
      const securityService = new SecurityService();
  
      const result = await securityService.check(DeviceCheckType.debugModeEnabled);
  
      done(result);
    });

    result.passed.should.equal(true);
  });

  it('should be possible to run `screenLock` check', async function() {
    const result = await client.executeAsync(async done => {
      const { SecurityService, DeviceCheckType } = window.aerogear.agSecurity;
      const securityService = new SecurityService();
  
      const result = await securityService.check(DeviceCheckType.screenLockEnabled);
  
      done(result);
    });

    result.passed.should.equal(false);
  });

  it('should be possible to run multiple checks', async function() {
    const result = await client.executeAsync(async done => {
      const { SecurityService, DeviceCheckType } = window.aerogear.agSecurity;
      const securityService = new SecurityService();

      const result = await securityService.checkMany(
        DeviceCheckType.debugModeEnabled,
        DeviceCheckType.rootEnabled,
        DeviceCheckType.isEmulator,
        DeviceCheckType.screenLockEnabled
      );
  
      done(result);
    });

    result.find(r => r.name === 'Debugger Check').passed.should.equal(true);
    result.find(r => r.name === 'Rooted Check').passed.should.equal(true);
    result.find(r => r.name === 'Emulator Check').passed.should.equal(false);
    result.find(r => r.name === 'Screen Lock Check').passed.should.equal(false);
  });

  it('should be possible to run custom check', async function() {
    const result = await client.executeAsync(async done => {
      class CustomDeviceCheck {
        get name() {
          return 'My Custom Check';
        }
      
        check() {
          return Promise.resolve({
            name: 'My Custom Check',
            passed: true
          });
        }
      }

      const { SecurityService } = window.aerogear.agSecurity;
      const securityService = new SecurityService();
  
      const result = await securityService.check(new CustomDeviceCheck());
        
      done(result);
    });

    result.passed.should.equal(true);
  });
});
