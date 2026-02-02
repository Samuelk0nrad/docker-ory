import { useEffect, useState } from 'react';
import { SelfServiceFlow } from './flow/SelfServiceFlow';
import { ResponseUI } from './types';
import { AxiosError } from 'axios';

export function useAuthFlow(
  flowId?: string,
  flowType: SelfServiceFlow = SelfServiceFlow.Registration
) {
  const flow = flowType;
  const [message, setMessage] = useState<{ text: string; type: string }[]>([]);
  const [data, setData] = useState<any>();
  const [messages, setMessages] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const startFlow = async () => {
    if (flowId) {
      await flow.getFlow(flowId);
    } else {
      await flow.createFlow();
    }
  };

  const updateData = (key: string, value: any) => {
    setData({ ...data, [key]: value });
  };

  const updateFlow = async (flowData: any) => {
    setIsLoading(true);
    try {
      if (flow) {
        const newFlow = await flow.updateFlow(flowData);
        flow.flow = newFlow;
      } else {
        throw new Error('Flow not initialized');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseUi: ResponseUI = error.response?.data?.ui;
        if (responseUi?.messages?.length > 0) {
          setMessage(
            responseUi.messages.map((msg) => ({
              text: msg.text,
              type: msg.type,
            }))
          );
        }
        if (responseUi.nodes?.length > 0) {
          const nodes = responseUi.nodes;
          nodes.forEach((node: any) => {
            setMessages({ ...messages, [node.attributes.name]: node.messages });
          });
        }
      } else {
        console.error(error);
        setMessage([
          {
            text: 'an error occurred, please try again later',
            type: 'error',
          },
        ]);
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

  return {
    flow,
    message,
    data,
    messages,
    isLoading,
    startFlow,
    setData: updateData,
    updateFlow,
  };
}
