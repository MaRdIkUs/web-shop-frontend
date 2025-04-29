import Keycloak from 'keycloak-js';
import { KEYCLOAK_CONFIG } from '../config';

const keycloak = new Keycloak(KEYCLOAK_CONFIG);
export default keycloak;
