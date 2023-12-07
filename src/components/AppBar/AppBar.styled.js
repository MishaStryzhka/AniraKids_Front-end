import styled from 'styled-components';

export const ContainerAppBar = styled.header(
    ({ $mainPage }) => `background-color: ${$mainPage ? 'red' : 'green'};`
);
