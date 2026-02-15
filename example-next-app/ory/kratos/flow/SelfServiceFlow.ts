import { AxiosResponse } from 'axios';
import { kratos } from '../kratos';
import { FlowMap } from './types/FlowMap';
import { FlowTypeEnum } from './types/FlowTypes';
import { UpdateFlowBodyMap } from './types/UpdateFlowBodyMap';
import { UpdateFlowResponseMap } from './types/UpdateFlowResponseMap';

// Constrain the generic to be one of the flow types
export class SelfServiceFlow<T extends keyof FlowMap = keyof FlowMap> {
  flowType: FlowTypeEnum;
  flow: FlowMap[T] | null = null;

  constructor(flowType: FlowTypeEnum) {
    this.flowType = flowType;
  }

  // Static instances for each flow type
  static Registration = new SelfServiceFlow<FlowTypeEnum.Registration>(
    FlowTypeEnum.Registration
  );
  static Login = new SelfServiceFlow<FlowTypeEnum.Login>(FlowTypeEnum.Login);
  static Recovery = new SelfServiceFlow<FlowTypeEnum.Recovery>(
    FlowTypeEnum.Recovery
  );
  static Settings = new SelfServiceFlow<FlowTypeEnum.Settings>(
    FlowTypeEnum.Settings
  );
  static Verification = new SelfServiceFlow<FlowTypeEnum.Verification>(
    FlowTypeEnum.Verification
  );

  toString() {
    return this.flowType;
  }

  // Methods to create a new ory kratos flow
  async createFlow(returnTo?: string): Promise<void> {
    switch (this.flowType) {
      case FlowTypeEnum.Registration:
        this.flow = (await kratos.createBrowserRegistrationFlow({ returnTo }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Login:
        this.flow = (await kratos.createBrowserLoginFlow({ returnTo }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Recovery:
        this.flow = (await kratos.createBrowserRecoveryFlow({ returnTo }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Settings:
        this.flow = (await kratos.createBrowserSettingsFlow({ returnTo }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Verification:
        this.flow = (await kratos.createBrowserVerificationFlow({ returnTo }))
          .data as FlowMap[T];
        break;
      default:
        throw new Error('Invalid flow type');
    }
  }

  // Method to get an existing flow by ID
  async getFlow(flowId: string): Promise<void> {
    switch (this.flowType) {
      case FlowTypeEnum.Registration:
        this.flow = (await kratos.getRegistrationFlow({ id: flowId }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Login:
        this.flow = (await kratos.getLoginFlow({ id: flowId }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Recovery:
        this.flow = (await kratos.getRecoveryFlow({ id: flowId }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Settings:
        this.flow = (await kratos.getSettingsFlow({ id: flowId }))
          .data as FlowMap[T];
        break;
      case FlowTypeEnum.Verification:
        this.flow = (await kratos.getVerificationFlow({ id: flowId }))
          .data as FlowMap[T];
        break;
      default:
        throw new Error('Invalid flow type');
    }
  }

  async updateFlow(
    flowData: UpdateFlowBodyMap[T]
  ): Promise<AxiosResponse<UpdateFlowResponseMap[T], unknown, Record<string, unknown>>> {
    if (!this.flow) {
      throw new Error('Flow not initialized');
    }

    let response;

    switch (this.flowType) {
      case FlowTypeEnum.Registration:
        response = await kratos.updateRegistrationFlow({
          flow: this.flow.id!,
          updateRegistrationFlowBody: flowData as UpdateFlowBodyMap[FlowTypeEnum.Registration],
        });
        break;
      case FlowTypeEnum.Login:
        response = await kratos.updateLoginFlow({
          flow: this.flow.id!,
          updateLoginFlowBody: flowData as UpdateFlowBodyMap[FlowTypeEnum.Login],
        });
        break;
      case FlowTypeEnum.Recovery:
        response = await kratos.updateRecoveryFlow({
          flow: this.flow.id!,
          updateRecoveryFlowBody: flowData as UpdateFlowBodyMap[FlowTypeEnum.Recovery],
        });
        break;
      case FlowTypeEnum.Settings:
        response = await kratos.updateSettingsFlow({
          flow: this.flow.id!,
          updateSettingsFlowBody: flowData as UpdateFlowBodyMap[FlowTypeEnum.Settings],
        });
        break;
      case FlowTypeEnum.Verification:
        response = await kratos.updateVerificationFlow({
          flow: this.flow.id!,
          updateVerificationFlowBody: flowData as UpdateFlowBodyMap[FlowTypeEnum.Verification],
        });
        break;
      default:
        throw new Error('Invalid flow type');
    }

    // Update the flow with the response data if it contains a flow object
    const responseData = response.data as UpdateFlowResponseMap[T];
    if (
      responseData &&
      typeof responseData === 'object' &&
      'id' in responseData
    ) {
      this.flow = responseData as FlowMap[T];
    }

    return response as AxiosResponse<UpdateFlowResponseMap[T], unknown, Record<string, unknown>>;
  }
}
