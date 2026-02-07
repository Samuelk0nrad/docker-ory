import {
  ContinueWith,
  UiContainer,
  UiNode,
  UiNodeInputAttributes,
  UiText,
} from '@ory/client';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { SelfServiceFlow } from './flow/SelfServiceFlow';
import { FlowMap } from './flow/types/FlowMap';
import { FlowTypeEnum } from './flow/types/FlowTypes';
import { GenericFlowResponse } from './flow/types/GenericFlowResponse';
import { UpdateFlowBodyMap } from './flow/types/UpdateFlowBodyMap';
import { getCsrfToken } from './utils';

export function useAuthFlow<
  T extends keyof FlowMap = FlowTypeEnum.Registration,
  B = UpdateFlowBodyMap[T],
>(flowType: SelfServiceFlow<T>, flowId?: string, method?: string) {
  const flow = flowType;
  const [data, setData] = useState<Partial<B>>(
    method ? ({ method } as unknown as Partial<B>) : {}
  );
  const [messages, setMessages] = useState<
    Record<string, UiText | { text: string; type: string }>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  async function startFlow(): Promise<boolean> {
    let res = true;
    try {
      if (flowId) {
        await flow.getFlow(flowId);
      } else {
        await flow.createFlow();
      }
      setCsrfToken();
      handleResponse(flow.flow as unknown as GenericFlowResponse);
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as GenericFlowResponse;
        if (responseData?.error || responseData?.ui) {
          handleResponse(responseData);
        } else {
          updateMessages('general', {
            text: 'An error occurred, please try again later',
            type: 'error',
          });
        }
      } else {
        updateMessages('general', {
          text: 'An unexpected error occurred',
          type: 'error',
        });
      }
      res = false;
    }
    return res;
  }

  function setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ) {
    const keys = path.split('.');
    const result: Record<string, any> = { ...obj };
    let current = result;

    keys.forEach((keyPart, index) => {
      if (index === keys.length - 1) {
        current[keyPart] = value;
      } else {
        current[keyPart] = { ...(current[keyPart] ?? {}) };
        current = current[keyPart];
      }
    });
    return result;
  }

  function normalizeMessageKey(key: string) {
    return key.startsWith('traits.') ? key.replace('traits.', '') : key;
  }

  function updateData(key: string, value: unknown) {
    const updated = key.includes('.')
      ? setNestedValue(data as Record<string, unknown>, key, value)
      : { ...data, [key]: value };
    setData((prev) => {
      return { ...prev, ...updated };
    });
  }

  function updateMessages(key: string, value: Pick<UiText, 'text' | 'type'>) {
    setMessages((prev) => ({ ...prev, [key]: value }));
  }

  async function updateFlow(): Promise<boolean> {
    setIsLoading(true);
    let res = true;
    try {
      if (flow) {
        const result = await flow.updateFlow(
          data as unknown as UpdateFlowBodyMap[T]
        );

        handleResponse(result.data as unknown as GenericFlowResponse);
      } else {
        throw new Error('Flow not initialized');
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        handleResponse(error.response?.data as GenericFlowResponse);
      } else {
        updateMessages('general', {
          text: 'An unexpected error occurred during update',
          type: 'error',
        });
      }
      res = false;
    } finally {
      setIsLoading(false);
    }
    return res;
  }

  function handleResponse(response: GenericFlowResponse) {
    if (response.continue_with) {
      handleContinueWith(response.continue_with);
    }
    if (response.redirect_browser_to) {
      window.location.href = response.redirect_browser_to;
      return;
    }
    if (response.error) {
      updateMessages('general', {
        text: response.error.message,
        type: 'error',
      });
    }
    if (response.ui) {
      const responseUi: UiContainer = response.ui;
      if (responseUi.messages && responseUi.messages.length > 0) {
        const msg = responseUi.messages[0];
        updateMessages('general', msg);
      }
      if (responseUi.nodes && responseUi.nodes.length > 0) {
        responseUi.nodes.forEach((node: UiNode) => {
          if (node.attributes.node_type === 'input') {
            const attributes = node.attributes as UiNodeInputAttributes;
            const normalizedKey = normalizeMessageKey(attributes.name);
            if (node.messages.length > 0) {
              const msg = node.messages[0];
              setMessages((prev) => ({
                ...prev,
                [normalizedKey]: msg,
              }));
            }
          }
        });
      }
    }
  }

  function handleContinueWith(continueWith: Array<ContinueWith>) {
    // Check for UI flows first (higher priority)
    for (const c of continueWith) {
      if (c.action === 'show_recovery_ui') {
        window.location.href =
          c.flow.url ?? `http://localhost:3000/auth/recovery?flow=${c.flow.id}`;
        return;
      } else if (c.action === 'show_settings_ui') {
        window.location.href =
          c.flow.url ?? `http://localhost:3000/auth/settings?flow=${c.flow.id}`;
        return;
      } else if (c.action === 'show_verification_ui') {
        window.location.href =
          c.flow.url ??
          `http://localhost:3000/auth/verification?flow=${c.flow.id}`;
        return;
      }
    }

    // Only check for redirect if no UI flow was found
    const redirect = continueWith.find(
      (c) => c.action === 'redirect_browser_to'
    );
    if (redirect) {
      window.location.href = redirect.redirect_browser_to;
    }
  }

  function resetFlowData() {
    setData(method ? ({ method } as unknown as Partial<B>) : {});
    setMessages({});
    setCsrfToken();
  }

  function setCsrfToken() {
    if (flow.flow) {
      const csrf_token = getCsrfToken(flow.flow);
      updateData('csrf_token', csrf_token);
    }
  }

  useEffect(() => {
    const fetchFlow = async () => {
      await startFlow();
    };
    fetchFlow();
  }, [flowId, flowType]);

  function setMethod(method: string) {
    updateData('method', method);
  }

  return {
    flow,
    data,
    messages,
    isLoading,
    startFlow,
    setMethod,
    setData: updateData,
    setMessages: updateMessages,
    resetFlowData,
    updateFlow,
  };
}
