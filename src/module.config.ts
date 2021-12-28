import { SimulatingMultisigRequest } from "./dtos/requests/simulating/simulating-multisig.request"

export const ENTITIES_CONFIG = {

}

export const REQUEST_CONFIG = {
    SIMULATING_MULTISIG_REQUEST: SimulatingMultisigRequest
}

export module MODULE_REQUEST {
    export abstract class SimulatingMultisigRequest extends REQUEST_CONFIG.SIMULATING_MULTISIG_REQUEST{}
}

export const SERVICE_INTERFACE = {
    ISIMULATING_SERVICE: "ISimulatingService"
}

export const REPOSITORY_INTERFACE = {

}

export const PROVIDER_INTERFACE = {

}