import styled from "styled-components";

import Icon from "./Icon";

const BigIcon = styled(Icon)`
  font-size: 7rem;
  margin: 1rem 0 1.5rem 0;
  color: rgba(255, 255, 255, 1);

  ${(props) =>
    props.disabled &&
    `
    opacity: 0.25;
  `}
`;

export default BigIcon;
