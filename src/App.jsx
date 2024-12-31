import { useState } from "react";
import "./app.scss";
import MenuWrapper from "./Component/MenuWrapper";

const initMenus = [
  {
    id: "Home",
    name: "Home",
    href: "/home",
  },
  {
    id: "Collections",
    href: "/collections",
    name: "Collections",
    children: [
      {
        id: "Sub Item 1",
        name: "Sub Item 1",
        href: "/sub-item-1",
      },
      {
        id: "Sub Item 2",
        name: "Sub Item 2",
        href: "/sub-item-2",
      },
      {
        id: "Sub Item 3",
        name: "Sub Item 3",
        href: "/sub-item-3",
      },
      {
        id: "Sub Item 4",
        name: "Sub Item 4",
        href: "/sub-item-4",
      },
    ],
  },
  {
    id: "About Us",
    name: "About Us",
    href: "/about-us",
  },
  {
    id: "My Account",
    name: "My Account",
    href: "/my-account",
    children: [
      {
        id: "Addresses",
        name: "Addresses",
        href: "/addresses",
      },
      {
        id: "Order History",
        name: "Order History",
        href: "/order-history",
      },
    ],
  },
];

const App = () => {
  const [menus, setMenus] = useState(initMenus);

  return (
    <div className={`${classPrefix}-app`}>
      <h1>Wordpress like menu structure</h1>
      <br />
      <hr />
      <br />
      <MenuWrapper menus={menus} setMenus={setMenus} />
    </div>
  );
};

export default App;
