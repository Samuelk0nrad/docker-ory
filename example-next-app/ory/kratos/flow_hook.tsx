import { useEffect, useState } from 'react';
import { SelfServiceFlow } from './flow/SelfServiceFlow';
import { ResponseUI } from './types';
import { AxiosError } from 'axios';
import { getCsrfToken } from '@/lib/utils';
import { ContinueWith } from '@ory/client';

export function useAuthFlow(
  flowId?: string,
  flowType: SelfServiceFlow = SelfServiceFlow.Registration
) {
  const flow = flowType;
  const [data, setData] = useState<any>({});
  const [messages, setMessages] = useState<any>({});
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
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data.error) {
        handleResponse(error.response?.data);
      } else {
        updateMessages('general', {
          text: 'an error occurred please try again later',
          type: 'error',
        });
      }
      res = false;
    }
    return res;
  }

  function setNestedValue(obj: Record<string, any>, path: string, value: any) {
    const keys = path.split('.');
    const result = { ...obj };
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

  function updateData(key: string, value: any) {
    const updated = key.includes('.')
      ? setNestedValue(data, key, value)
      : { ...data, [key]: value };
    setData((prev: any) => {
      return { ...prev, ...updated };
    });
  }

  function updateMessages(key: string, value: any) {
    setMessages((prev: any) => ({ ...prev, [key]: value }));
  }

  async function updateFlow(): Promise<boolean> {
    setIsLoading(true);
    let res = true;
    try {
      if (flow) {
        const newFlow = await flow.updateFlow(data);

        handleResponse(newFlow);

        flow.flow = newFlow;
      } else {
        throw new Error('Flow not initialized');
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        handleResponse(error.response?.data);
      }
      res = false;
    } finally {
      setIsLoading(false);
    }
    return res;
  }

  function handleResponse(response: any) {
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
      const responseUi: ResponseUI = response.ui;
      if (responseUi?.messages?.length > 0) {
        updateMessages(
          'general',
          responseUi.messages.map((msg) => ({
            text: msg.text,
            type: msg.type,
          }))[0]
        );
      }
      if (responseUi.nodes?.length > 0) {
        const nodes = responseUi.nodes;
        nodes.forEach((node: any) => {
          const normalizedKey = normalizeMessageKey(node.attributes.name);
          setMessages((pres: any) => ({
            ...pres,
            [normalizedKey]: {
              text: node.messages[0]?.text,
              type: node.messages[0]?.type,
            },
          }));
        });
      }
    }
  }

  function handleContinueWith(continueWith: Array<ContinueWith>) {
    continueWith.forEach((c) => {
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
    });
    if (continueWith.some((c) => c.action === 'redirect_browser_to')) {
      const redirect = continueWith.find(
        (c) => c.action === 'redirect_browser_to'
      );
      if (redirect) {
        window.location.href = redirect.redirect_browser_to;
      }
    }
  }

  function resetFlowData() {
    setData({});
    setMessages({});
    setCsrfToken();
  }

  function setCsrfToken() {
    const csrf_token = getCsrfToken(flow.flow);
    updateData('csrf_token', csrf_token);
  }

  useEffect(() => {
    const fetchFlow = async () => {
      startFlow();
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
