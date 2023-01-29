import React from "react";
import { useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Dropdown,
  Grid,
  Header,
  Loader,
  Segment,
} from "semantic-ui-react";
import { AuthMethod, AviableAuthMethods } from "../../config/AuthMethods";
import { AppRuntimeSettingsContext, AuthContext, WebsocketContext } from "../../context";
import { authByOauth } from "../../utils/Oauth";
import MetaRobots from "../Meta/MetaRobots";

interface ForbiddenPageProps {
  missingAuthorities?: string[];
  missingAuth?: boolean;
}

function ForbiddenPage({
  missingAuthorities,
  missingAuth,
}: ForbiddenPageProps) {
  const authContext = useContext(AuthContext);
  const { isGHostSocketConnected } = useContext(WebsocketContext);

  const {language} = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
  const onSuccess = useCallback(
    (token: string, type: number) => {
      authContext.dispatchAuth({
        action: "saveCredentials",
        payload: { token, type },
      });
    },
    [authContext]
  );

  const loginHint = (
    <>
      <p>{t("page.forbidden.thisPage")}:</p>
      <Grid.Row>
        {AviableAuthMethods.map((method: AuthMethod) => {
          return (
            <Button
              key={method.name}
              color={method.color}
              onClick={() => authByOauth(method, onSuccess)}
            >
              {method.name}
            </Button>
          );
        })}
      </Grid.Row>
    </>
  );

  const waitLoader = (
    <>
      <p>
      {t("page.forbidden.wait")}
      </p>
      <Grid.Row>
        <Header>
          {isGHostSocketConnected ? t("page.forbidden.authorization") : t("page.forbidden.connecting") }
        </Header>
      </Grid.Row>
    </>
  );

  return (
    <Container className="not-found">
      <MetaRobots noIndex />
      <div className="centerd">
        <Grid centered>
          <Grid.Row>
            <Header>{t("page.forbidden.denied")}</Header>
          </Grid.Row>
          {!authContext.auth.currentAuth ? (
            authContext.auth.authCredentials ? (
              waitLoader
            ) : (
              loginHint
            )
          ) : (
            <Grid.Row>
              <p>
              {t("page.forbidden.norights")}
              </p>
            </Grid.Row>
          )}

          <Grid.Row>
            <Button to="/" as={Link} color="green">
            {t("page.forbidden.main")}
            </Button>
          </Grid.Row>
        </Grid>
      </div>
    </Container>
  );
}

export default ForbiddenPage;
