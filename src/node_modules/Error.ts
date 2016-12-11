export async function reportOnError(promise: Promise<any>) {
  try {
    await promise;
  } catch (err) {
    console.error(err);
  }
}
