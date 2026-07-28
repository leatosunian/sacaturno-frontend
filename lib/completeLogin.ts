export interface LoginResponseData {
  userID: string;
  token: string;
  contexts?: Array<{
    role: string;
    businessID: string;
    businessName: string;
    employeeID?: string;
  }>;
}

// Persiste la sesión (localStorage + cookies httpOnly vía /api/login) y devuelve
// si el usuario debe pasar por la pantalla de selección de contexto.
// Compartido por el login clásico (FormLogin) y el login con Google.
export const completeLogin = async (
  responseData: LoginResponseData,
  saveAuthData: (loginData: { userID: string; token: string }) => void,
): Promise<boolean> => {
  localStorage.setItem("sacaturno_userID", responseData.userID);
  localStorage.setItem("sacaturno_token", responseData.token);

  const apiRes = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({
      token: responseData.token,
      userID: responseData.userID,
      contexts: responseData.contexts,
    }),
    headers: { "content-type": "application/json" },
  });
  const apiData = await apiRes.json();

  saveAuthData({ userID: responseData.userID, token: responseData.token });

  return apiData.needsContextSelection ?? false;
};
