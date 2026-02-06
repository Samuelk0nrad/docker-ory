export function getCsrfToken(flow: any) {
  return flow.ui.nodes.find(
    (node: any) =>
      node.type === 'input' && node.attributes.name === 'csrf_token'
  )?.attributes.value;
}
