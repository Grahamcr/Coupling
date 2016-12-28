"use strict";
import {element, browser, By} from "protractor";

const config = require("../../config");
const e2eHelp = require('./e2e-help');
const hostName = 'http://' + config.publicHost + ':' + config.port;

describe('The welcome page', function () {

    it('has an enter button redirects to google login', function () {
        browser.get(hostName + '/welcome');
        element(By.tagName('body')).allowAnimations(false);
        element(By.id('enter-button')).click();
        expect(browser.getCurrentUrl()).toBe(hostName + '/auth/google');
    });

    e2eHelp.afterEachAssertLogsAreEmpty();
});