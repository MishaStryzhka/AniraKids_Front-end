import { NavLink, useLocation } from 'react-router-dom';
import { ContainerAppBar } from './AppBar.styled';

const AppBar = () => {
    const { pathname } = useLocation();
    console.log('pathname', pathname);
    console.log('pathname === `/`', pathname === `/`);

    return (
        <ContainerAppBar $mainPage={pathname === `/`}>
            <NavLink to='./'>Logo</NavLink>
            <p>AppBar</p>
            <NavLink to='./forMen'>forMen</NavLink>
            <NavLink to='./forWomen'>forWomen</NavLink>
            <NavLink to='./forChildren'>forChildren</NavLink>
            <NavLink to='./decorAndToys'>forMen</NavLink>
            <NavLink to='./aboutUs'>forMen</NavLink>
        </ContainerAppBar>
    );
};

export default AppBar;
