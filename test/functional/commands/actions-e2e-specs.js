import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidDriver from '../../..';
import _ from 'lodash';
import DEFAULT_CAPS from '../desired';


chai.should();
chai.use(chaiAsPromised);

const PNG_MAGIC = '89504e47';
const PNG_MAGIC_LENGTH = 4;
const DATE_WIDGET_ACTIVITY = '.view.DateWidgets1';
const CUSTOM_PICKER_ACTIVITY ='.view.CustomPicker1';

let driver;
let caps = _.defaults({
  appPackage: 'io.appium.android.apis',
  appActivity: '.view.TextFields'
}, DEFAULT_CAPS);


describe('actions', () => {
  before(async () => {
    driver = new AndroidDriver();
    await driver.createSession(caps);
  });
  after(async () => {
    await driver.deleteSession();
  });

  describe('replaceValue', function () {
    it('should replace existing value in a text field', async () => {
      let el = _.last(await driver.findElOrEls('class name', 'android.widget.EditText', true));
      el.should.exist;
      await driver.setValue('original value', el.ELEMENT);
      await driver.getText(el.ELEMENT).should.eventually.equal('original value');

      await driver.replaceValue('replaced value', el.ELEMENT);
      await driver.getText(el.ELEMENT).should.eventually.equal('replaced value');
    });
    it('should be able to set text in time picker', async () => {
      await driver.startActivity(caps.appPackage, DATE_WIDGET_ACTIVITY);
      let dialogButton = await driver.findElOrEls('id', 'io.appium.android.apis:id/pickTimeSpinner', false);
      await driver.click(dialogButton.ELEMENT);

      let hours = await driver.findElOrEls('xpath', '//android.widget.NumberPicker[1]//android.widget.EditText', false);
      await driver.replaceValue('9', hours.ELEMENT);

      let minutes = await driver.findElOrEls('xpath', '//android.widget.NumberPicker[2]//android.widget.EditText', false);
      await driver.replaceValue('59', minutes.ELEMENT);

      let pm = await driver.findElOrEls('xpath', '//*[@text="PM"]', false);
      await driver.touchLongClick(pm.ELEMENT);

      let okButton = await driver.findElOrEls('xpath', '//*[@text="OK"]', false);
      await driver.click(okButton.ELEMENT);

      let date = await driver.findElOrEls('id', 'io.appium.android.apis:id/dateDisplay', false);
      await driver.getText(date.ELEMENT).should.eventually.contains('21:59');
    });
    it('should be able to set text in picker with custom displayed values', async () => {
      await driver.startActivity(caps.appPackage, CUSTOM_PICKER_ACTIVITY);
      let customPicker = await driver.findElOrEls('xpath', '//android.widget.NumberPicker//android.widget.EditText', false);

      await driver.replaceValue('kupima', customPicker.ELEMENT);
      // Force get focus event
      await driver.click(customPicker.ELEMENT);

      let textView = await driver.findElOrEls('id', 'io.appium.android.apis:id/textView1', false);
      await driver.getText(textView.ELEMENT).should.eventually.contains('kupima');
    });
  });

  describe('key codes', function () {
    beforeEach(async () => {
      await driver.startActivity(caps.appPackage, caps.appActivity);
    });

    it('should press key code 3 without metastate', async () => {
      await driver.pressKeyCode(3).should.not.be.rejected;
    });
    it('should press key code 3 with metastate', async () => {
      await driver.pressKeyCode(3, 193).should.not.be.rejected;
    });
    it('should long press key code 3 without metastate', async () => {
      await driver.longPressKeyCode(3).should.not.be.rejected;
    });
    it('should long press key code 3 with metastate', async () => {
      await driver.longPressKeyCode(3, 193).should.not.be.rejected;
    });
  });

  describe('getScreenshot', function () {
    it('should return valid base64-encoded screenshot', async () => {
      const base64screenshot = await driver.getScreenshot();
      const imageMagic = new Buffer(base64screenshot, 'base64').toString('hex', 0, PNG_MAGIC_LENGTH);
      imageMagic.should.be.equal(PNG_MAGIC);
    });
  });
});
