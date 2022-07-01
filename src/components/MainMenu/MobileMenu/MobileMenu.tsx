import React, { ReactNode, useContext } from "react";
import {
  Icon,
  Menu,
  SemanticICONS,
  Checkbox,
  CheckboxProps,
} from "semantic-ui-react";
import LoginDropdown from "../../Header/LoginDropdown";
import UserDrowdown from "../../Header/UserDropdown";
import { AuthContext } from "./../../../context/index";
import { switchTheme, E_THEME, currentTheme } from "../../../utils/Theme";
import "./MobileMenu.scss";
import UploadMap from "../../Header/UploadMap";
import { NavLink } from "react-router-dom";

export interface MenuItem {
  type: string;
  position?: "left" | "right";
  icon?: SemanticICONS;
  name: string;
  text?: string;
  node?: ReactNode;
  subMenu?: Array<MenuItem>;
  onClick?;
}

const MobileMenu = () => {
  const authContext = useContext(AuthContext);
  const currentAuth = authContext.auth.currentAuth;

  const onBurgerButtonClick = () => {
    const mobileMenu = document.querySelector(".burger-mobile-menu");
    const burgerIcon = document.querySelector(".burger-icon");
    const overlay = document.querySelector(".mobile-menu-pushable");
    mobileMenu.classList.toggle("active");
    overlay.classList.toggle("active");
    burgerIcon.classList.toggle("sidebar");
    burgerIcon.classList.toggle("close");
  };

  const handleMenuItemClick = () => {
    console.log("menu item clicked");
  };

  return (
    <Menu fixed="top" inverted className="main-menu mobile-menu">
      <Menu.Item className="burger-button" onClick={onBurgerButtonClick}>
        <Icon name="sidebar" className="burger-icon" />
      </Menu.Item>
      <Menu.Menu position="right">
        {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
      </Menu.Menu>
      <div className="burger-mobile-menu">
        <Menu.Item as={NavLink} to="/gamelist">
          <Icon name="gamepad" />
          Активные Игры
        </Menu.Item>
        <UploadMap />
        <Menu.Item as={NavLink} to="/autopay">
          <Icon name="ruble sign" />
          Донат
        </Menu.Item>
        <Menu.Item onClick={handleMenuItemClick}>
          <Icon name="help" />
          Справка
        </Menu.Item>
        <Checkbox
          toggle
          className="item theme-switcher"
          checked={currentTheme === E_THEME.DARK}
          onChange={(_, data: CheckboxProps) =>
            switchTheme(data.checked ? E_THEME.DARK : E_THEME.LIGHT)
          }
          label={
            <>
              <Icon name="paint brush" />
              Сменить тему
            </>
          }
        />
      </div>
      <div className="mobile-menu-pushable" onClick={onBurgerButtonClick}></div>
    </Menu>
  );
};

export default MobileMenu;
