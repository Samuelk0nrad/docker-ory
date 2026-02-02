import {
  RegistrationFlow,
  LoginFlow,
  RecoveryFlow,
  SettingsFlow,
  VerificationFlow,
} from '@ory/client';
import { kratos } from '../kratos';
import { AnyFlow } from './types/AnyFlow';
import { FlowTypeEnum } from './types/FlowTypes';

// Constrain the generic to be one of the flow types
export class SelfServiceFlow<T extends AnyFlow = AnyFlow> {
  flowType: FlowTypeEnum;
  flow: T | null = null;

  constructor(flowType: FlowTypeEnum) {
    this.flowType = flowType;
  }

  // Static instances for each flow type
  static Registration = new SelfServiceFlow<RegistrationFlow>(
    FlowTypeEnum.Registration
  );
  static Login = new SelfServiceFlow<LoginFlow>(FlowTypeEnum.Login);
  static Recovery = new SelfServiceFlow<RecoveryFlow>(FlowTypeEnum.Recovery);
  static Settings = new SelfServiceFlow<SettingsFlow>(FlowTypeEnum.Settings);
  static Verification = new SelfServiceFlow<VerificationFlow>(
    FlowTypeEnum.Verification
  );

  toString() {
    return this.flowType;
  }

  // Methods to create a new ory kratos flow
  async createFlow(): Promise<void> {
    switch (this.flowType) {
      case FlowTypeEnum.Registration:
        this.flow = (await kratos.createBrowserRegistrationFlow()).data as T;
        break;
      case FlowTypeEnum.Login:
        this.flow = (await kratos.createBrowserLoginFlow()).data as T;
        break;
      case FlowTypeEnum.Recovery:
        this.flow = (await kratos.createBrowserRecoveryFlow()).data as T;
        break;
      case FlowTypeEnum.Settings:
        this.flow = (await kratos.createBrowserSettingsFlow()).data as T;
        break;
      case FlowTypeEnum.Verification:
        this.flow = (await kratos.createBrowserVerificationFlow()).data as T;
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
          .data as T;
        break;
      case FlowTypeEnum.Login:
        this.flow = (await kratos.getLoginFlow({ id: flowId })).data as T;
        break;
      case FlowTypeEnum.Recovery:
        this.flow = (await kratos.getRecoveryFlow({ id: flowId })).data as T;
        break;
      case FlowTypeEnum.Settings:
        this.flow = (await kratos.getSettingsFlow({ id: flowId })).data as T;
        break;
      case FlowTypeEnum.Verification:
        this.flow = (await kratos.getVerificationFlow({ id: flowId }))
          .data as T;
        break;
      default:
        throw new Error('Invalid flow type');
    }
  }

  // Method to update the flow
  async updateFlow(flowData: any): Promise<any> {
    if (!this.flow) {
      throw new Error('Flow not initialized');
    }

    let response;

    switch (this.flowType) {
      case FlowTypeEnum.Registration:
        response = await kratos.updateRegistrationFlow({
          flow: this.flow.id!,
          updateRegistrationFlowBody: flowData,
        });
        break;
      case FlowTypeEnum.Login:
        response = await kratos.updateLoginFlow({
          flow: this.flow.id!,
          updateLoginFlowBody: flowData,
        });
        break;
      case FlowTypeEnum.Recovery:
        response = await kratos.updateRecoveryFlow({
          flow: this.flow.id!,
          updateRecoveryFlowBody: flowData,
        });
        break;
      case FlowTypeEnum.Settings:
        response = await kratos.updateSettingsFlow({
          flow: this.flow.id!,
          updateSettingsFlowBody: flowData,
        });
        break;
      case FlowTypeEnum.Verification:
        response = await kratos.updateVerificationFlow({
          flow: this.flow.id!,
          updateVerificationFlowBody: flowData,
        });
        break;
      default:
        throw new Error('Invalid flow type');
    }
    return response.data;
  }
}
