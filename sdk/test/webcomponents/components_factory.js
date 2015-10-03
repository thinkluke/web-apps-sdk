/*
*
*Copyright (c) 2012-2014 Adobe Systems Incorporated. All rights reserved.

*Permission is hereby granted, free of charge, to any person obtaining a
*copy of this software and associated documentation files (the "Software"),
*to deal in the Software without restriction, including without limitation
*the rights to use, copy, modify, merge, publish, distribute, sublicense,
*and/or sell copies of the Software, and to permit persons to whom the
*Software is furnished to do so, subject to the following conditions:
*
*The above copyright notice and this permission notice shall be included in
*all copies or substantial portions of the Software.
*
*THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
*FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
*DEALINGS IN THE SOFTWARE.
*
*/
describe("BCAPI.Components.ComponentsFactory test suite.", function() {
    beforeEach(function() {
        jasmine.addMatchers(ComponentCustomMatchers);

        expect(BCAPI).not.toBe(undefined);
        expect(BCAPI.Components).not.toBe(undefined);
        expect(BCAPI.Components.ComponentsFactory).not.toBe(undefined);

        this._compFactory = BCAPI.Components.ComponentsFactory;
        this._testComponent = {
            executedEvents: {},
            registeredCallbacks: [],
            is: "bc-testcomponent",
            sayHello: function() {
                var self = this;

                this.registeredCallbacks.push(function(evtData) {
                    self.executedEvents.evt = evtData;
                });

                this.on("evt", this.registeredCallbacks[0]);
            }
        };

        this._compInstance = this._compFactory.get(this._testComponent);

        expect(this._compInstance).not.toBe(undefined);
        expect(typeof this._compInstance.isBcComponent).toBe("function");
        expect(this._compInstance.isBcComponent()).toBeTruthy();
        expect(typeof this._compInstance.wireEvents).toBe("function");
        expect(this._compInstance.__base).not.toBe(undefined);
        expect(this._compInstance.__base instanceof BCAPI.Components.Component).toBeTruthy();
    });

    it("Ensure a plain object can be correctly extended with component methods using ComponentsFactory implementation.", function() {
        var evtData = {"testAttr": 1};

        expect(this._compInstance.sayHello).toBe(this._testComponent.sayHello);
        expect(this._compInstance.is).toBe(this._testComponent.is);
        expect(typeof this._compInstance.executedEvents).toBe("object");

        this._compInstance.sayHello();
        expect(this._compInstance.registeredCallbacks.length).toBe(1);
        
        this._compInstance.trigger("evt", evtData);
        expect(this._compInstance.executedEvents.evt).toBe(evtData);

        this._compInstance.off("evt", this._compInstance.registeredCallbacks[0]);
        this._compInstance.trigger("evt", {});
        expect(this._compInstance.executedEvents.evt).toBe(evtData);

        this._compInstance.wireEvents("evt");
    });

    it("Ensure a plain object correctly wire events using inherited component method.", function() {
        var evtData1 = {"evtName": "evt1", "data": "test"},
            evtData2 = {"evtName": "evt2", "data": "test 2"},
            self = this;

        this._compInstance.registeredCallbacks.push(function(data) {
            self._compInstance.executedEvents[data.evtName] = data;
        });

        this._compInstance.wireEvents({
            "evt1": this._compInstance.registeredCallbacks[0],
            "evt2": this._compInstance.registeredCallbacks[0]
        });

        this._compInstance.trigger("evt1", evtData1);
        this._compInstance.trigger("evt2", evtData2);

        expect(this._compInstance.executedEvents.evt1).toBe(evtData1);
        expect(this._compInstance.executedEvents.evt2).toBe(evtData2);
    });

    it("Ensure undefined / null events are causing concrete exceptions for wireEvents method.", function() {
        var self = this;

        expect(function() {
            self._compInstance.wireEvents(undefined);
        }).toBeCustomError("BCAPI.Components.Exceptions.WireEventException");

        expect(function() {
            self._compInstance.wireEvents(null);
        }).toBeCustomError("BCAPI.Components.Exceptions.WireEventException");
    });

    it("Ensure events can not be registered without a callback.", function() {
        var self = this;

        expect(function() {
            self._compInstance.wireEvents({"customEvent": undefined});
        }).toBeCustomError("BCAPI.Components.Exceptions.WireEventException");

        expect(function() {
            self._compInstance.wireEvents({"customEvent": null});
        }).toBeCustomError("BCAPI.Components.Exceptions.WireEventException");
    });
});