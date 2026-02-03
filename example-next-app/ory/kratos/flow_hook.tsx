import { useEffect, useState } from 'react';
import { SelfServiceFlow } from './flow/SelfServiceFlow';
import { ResponseUI } from './types';
import { AxiosError } from 'axios';

export function useAuthFlow(
  flowId?: string,
  flowType: SelfServiceFlow = SelfServiceFlow.Registration
) {
  const flow = flowType;
  const [data, setData] = useState<any>({});
  const [messages, setMessages] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const startFlow = async () => {
    try {
      if (flowId) {
        await flow.getFlow(flowId);
      } else {
        await flow.createFlow();
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data.error) {
        console.log(error.response?.data);
        updateMessages('general', {
          text: error.response?.data.error.message,
          type: 'error',
        });
      } else {
        updateMessages('general', {
          text: 'an error occurred please try again later',
          type: 'error',
        });
      }
    }
  };

  const setNestedValue = (
    obj: Record<string, any>,
    path: string,
    value: any
  ) => {
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
  };

  const normalizeMessageKey = (key: string) =>
    key.startsWith('traits.') ? key.replace('traits.', '') : key;

  const updateData = (key: string, value: any) => {
    const updated = key.includes('.')
      ? setNestedValue(data, key, value)
      : { ...data, [key]: value };
    setData(updated);
  };

  const updateMessages = (key: string, value: any) => {
    setMessages({ ...messages, [key]: value });
  };

  const updateFlow = async () => {
    setIsLoading(true);
    try {
      if (flow) {
        const newFlow = await flow.updateFlow(data);
        flow.flow = newFlow;
      } else {
        throw new Error('Flow not initialized');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseUi: ResponseUI = error.response?.data?.ui;
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
            setMessages({ ...messages, [normalizedKey]: node.messages });
          });
        }
      } else {
        console.error(error);
        updateMessages('general', {
          text: 'an error occurred, please try again later',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchFlow = async () => {
      startFlow();
    };
    fetchFlow();
  }, [flowId, flowType]);

  const setMethod = (method: string) => {
    updateData('method', method);
  };

  return {
    flow,
    data,
    messages,
    isLoading,
    startFlow,
    setMethod,
    setData: updateData,
    updateFlow,
  };
}
