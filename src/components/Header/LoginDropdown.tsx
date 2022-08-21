import { useCallback, useContext } from "react";
import { Dropdown } from "semantic-ui-react";
import { AuthMethod, AviableAuthMethods } from "../../config/AuthMethods";
import { AuthContext } from "./../../context/index";
import { authByOauth } from "../../utils/Oauth";
import React from "react";

function LoginDropdown() {
  const authContext = useContext(AuthContext);

  const onSuccess = useCallback(
    (token: string, type: number) => {
      authContext.dispatchAuth({action: "saveCredentials", payload: {token, type}});
    },
    [authContext]
  );

  return (
    <Dropdown text="Войти" item>
      <Dropdown.Menu>
        {AviableAuthMethods.map((method: AuthMethod) => {
          return (
            <Dropdown.Item
              key={method.name}
              onClick={() => authByOauth(method, onSuccess)}
            >
              {method.name}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default LoginDropdown;
