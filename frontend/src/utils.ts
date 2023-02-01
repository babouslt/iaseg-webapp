export function checkNull(element: any, name: string): void {
  if (element == null) {
    console.log(`Broken assumption: ${name} is null`);
}
}