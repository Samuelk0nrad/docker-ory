import { UiNode, UiNodeInputAttributes } from '@ory/client';

export function getCsrfToken(flow: { ui?: { nodes?: UiNode[] } }): {
  error?: string;
  csrf_token?: string;
} {
  if (!flow?.ui?.nodes || !Array.isArray(flow.ui.nodes)) {
    return { error: 'Invalid flow structure: missing or invalid ui.nodes' };
  }

  try {
    const csrfToken = (flow.ui.nodes.find(
      (node: UiNode) =>
        node.type === 'input' &&
        node.attributes.node_type === 'input' &&
        node.attributes.name === 'csrf_token'
    )?.attributes as UiNodeInputAttributes | undefined)?.value;
    if (!csrfToken) {
      return { error: 'CSRF token not found' };
    }
    return { csrf_token: csrfToken };
  } catch (error) {
    return { error: 'An error occurred while retrieving the CSRF token' };
  }
}
