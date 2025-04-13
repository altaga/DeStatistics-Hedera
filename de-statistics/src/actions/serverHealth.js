"use server";

const myHeaders = new Headers();
myHeaders.append("X-API-Key", process.env.LILYPAD_APIKEY );

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

export async function checkServer() {
  return new Promise(async (resolve, reject) => {
    try {
      fetch(`${process.env.LILYPAD_URL}/`, requestOptions)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch(() => resolve(false));
    } catch (e) {
      resolve(false);
    }
  });
}
