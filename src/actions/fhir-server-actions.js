import * as types from './action-types';

/**
 * Signals successful connection to FHIR server in context.
 * @param baseUrl - FHIR server base URL in context
 * @param metadata - data returned by metadata endpoint
 * @returns {{type, baseUrl: *, metadata: *}} - Action to dispatch
 */
export function signalSuccessFhirServerRetrieval(baseUrl, metadata) {
  return {
    type: types.GET_FHIR_SERVER_SUCCESS,
    baseUrl,
    metadata,
  };
}

/**
 * Signals failed connection to FHIR server in context.
 * @returns {{type}} - Action to dispatch
 */
export function signalFailureFhirServerRetrieval() {
  return {
    type: types.GET_FHIR_SERVER_FAILURE,
  };
}

/**
 * Set the test FHIR server in context of the application
 * @param fhirServer - FHIR server to test connectivity for
 */
export function setTestFhirServer(fhirServer) {
  return {
    type: types.SET_TEST_FHIR_SERVER,
    fhirServer,
  };
}
