export type LoginFlowPayload = {
    method: "password"
    identifier: string
    password: string
    csrf_token: string
}

export type RegistrationFlowPayload = {
    method: "password"
    traits: {
        email: string,
        name: string
    }
    password: string
    csrf_token: string
}

export type ResponseUI = {
    action: string
    method: string
    nodes: Array<ResponseUINode>
    messages: Array<{ text: string, type: string }>
}

export type ResponseUINode = {
    attributes: {
        name: string
        type: string
        value?: string
        required: boolean
        disabled: boolean
        label?: string
        pattern?: string
        minLength?: number
        maxLength?: number
    }
    messages: Array<{ text: string, type: string }>
}