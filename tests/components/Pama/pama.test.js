import React from "react";
import { mount, shallow } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import "core-js/es/array/flat-map";

describe("Pama component", () => {
  let storeState;
  let wrapper;
  let pureComponent;
  let mockStore;
  let mockStoreWrapper = configureStore([]);

  let ConnectedView;
  let Pama;
  let mockSpy;

  function setup(state) {
    mockStore = mockStoreWrapper(state);
    jest.setMock(
      "../../../src/retrieve-data-helpers/service-exchange",
      mockSpy
    );
    ConnectedView = require("../../../src/components/Pama/pama").default;
    Pama = require("../../../src/components/Pama/pama")["Pama"];

    let component = <ConnectedView store={mockStore} />;
    wrapper = shallow(component);
    pureComponent = wrapper.find(Pama);
  }

  beforeEach(() => {
    storeState = {
      patientState: { currentPatient: { id: "patient-123" } },
      pama: {
        serviceRequest: {
          studyCoding: {
            code: "1"
          },
          reasonCodings: [
            {
              code: "2"
            }
          ]
        },
        pamaRating: "appropriate"
      }
    };
    mockSpy = jest.fn();
    setup(storeState);
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("matches props passed down from Redux decorator", () => {
    expect(pureComponent.prop("pamaRating")).toEqual(
      storeState.pama.pamaRating
    );
    expect(pureComponent.prop("serviceRequest")).toEqual(
      storeState.pama.serviceRequest
    );
  });

  it("creates hook context correctly", () => {
    const generateContext = require("../../../src/components/Pama/pama")
      .pamaTriggerHandler.generateContext;
    const context = generateContext(storeState);
    expect(context.selections).toEqual(["ServiceRequest/example-request-id"]);

    const expectedDraftOrders = {
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "ServiceRequest",
            id: "example-request-id",
            status: "draft",
            intent: "plan",
            code: {
              coding: [
                {
                  code: "1"
                }
              ]
            },
            subject: {
              reference: "Patient/patient-123"
            },
            reasonCode: [
              {
                coding: [
                  {
                    code: "2"
                  }
                ]
              }
            ]
          }
        }
      ]
    };

    expect(context.draftOrders).toMatchObject(expectedDraftOrders);
  });

  it("Handles onMessage payloads correctly", () => {
    const data = {
      messageType: "scratchpad.update",
      payload: {
        resource: {
          resourceType: "ServiceRequest",
          id: "example-request-id",
          code: {
            coding: [
              {
                code: "72133"
              }
            ]
          },
          reasonCode: [{ coding: [{ code: "123" }] }],
          extension: [
            {
              url: "http://fhir.org/argonaut/Extension/pama-rating",
              valueCodeableConcept: {
                coding: [
                  {
                    code: "no-criteria-apply"
                  }
                ]
              }
            }
          ]
        }
      }
    };

    const onMessage = require("../../../src/components/Pama/pama")
      .pamaTriggerHandler.onMessage;
    const dispatch = jest.fn();
    onMessage({ data, dispatch });
    expect(dispatch).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_IMAGING_ORDER',
      pamaRating: 'no-criteria-apply',
      studyCoding: {
        code: '72133',
      },
      reasonCodings: [
        {
          code: '123',
        },
      ],
    });
  });

  it("Handles applying a suggested update correctly", () => {
    const suggestion = {
      actions: [
        {
          type: "update",
          resource: {
            resourceType: "ServiceRequest",
            id: "example-request-id",
            code: {
              coding: [
                {
                  code: "72133"
                }
              ]
            },
            reasonCode: [{ coding: [{ code: "123" }] }],
            extension: [
              {
                url: "http://fhir.org/argonaut/Extension/pama-rating",
                valueCodeableConcept: {
                  coding: [
                    {
                      code: "no-criteria-apply"
                    }
                  ]
                }
              }
            ]
          }
        }
      ],
    };

    const takeSuggestion = require("../../../src/components/Pama/pama")
      .dispatchSuggestedUpdates;
    const dispatch = jest.fn();
    takeSuggestion(dispatch, suggestion);
    expect(dispatch).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_IMAGING_ORDER',
      pamaRating: 'no-criteria-apply',
      studyCoding: {
        code: '72133',
      },
      reasonCodings: [
        {
          code: '123',
        },
      ],
    });
  });
});
