import React, { useState } from "react";
import styled from "styled-components";
import { useGesture } from "@use-gesture/react";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 480px;
  width: 100vw;
  overflow: hidden;
  background: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
`;

const CarouselContainer = styled.div`
  display: flex;
  transform: translateX(${(props) => props.$offset}px);
  transition: transform
    ${(props) =>
      props.$transitioning ? "0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "0s"};
  width: 100%;
  position: relative;

  &:after {
    content: "← Swipe →";
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.1);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    pointer-events: none;
    opacity: ${(props) => (props.$swiping ? 0 : 0.7)};
    transition: opacity 0.3s;
  }
`;

const NavigationDots = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  position: absolute;
  bottom: 20px;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "#007bff" : "#ccc")};
  transition: background 0.3s, transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: scale(1.2);
  }
`;

const Card = styled.div`
  min-width: 1920px;
  width: 1920px;
  height: 480px;
  margin: 0;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  padding: 20px;
  box-sizing: border-box;

  h2 {
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  button {
    padding: 0.8rem 1.5rem;
    font-size: 1.2rem;
    border-radius: 8px;
    border: none;
    background: #007bff;
    color: white;
    cursor: pointer;
    &:hover {
      background: #0056b3;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    font-size: 1.2rem;
    li {
      margin: 0.5rem 0;
    }
  }

  input[type="color"] {
    width: 80px;
    height: 80px;
    border: none;
    border-radius: 8px;
    margin: 0.5rem;
  }

  p {
    font-size: 1.2rem;
    margin: 0.5rem;
  }
`;

const HorizontalLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  > * {
    margin: 0 1rem;
  }
`;

const RefreshButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  font-size: 14px;
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    background: rgba(0, 123, 255, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Example Components
const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2>Counter App</h2>
      <HorizontalLayout>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </HorizontalLayout>
    </div>
  );
};

const TodoList = () => {
  const [todos, setTodos] = useState(["Learn React", "Build Apps"]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo("");
    }
  };

  return (
    <div>
      <h2>Todo List</h2>
      <HorizontalLayout>
        <ul style={{ display: "flex", gap: "2rem" }}>
          {todos.map((todo, index) => (
            <li key={index}>{todo}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="New todo"
            style={{
              padding: "0.8rem",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
          <button onClick={addTodo}>Add Todo</button>
        </div>
      </HorizontalLayout>
    </div>
  );
};

const ColorPicker = () => {
  const [color, setColor] = useState("#ff0000");
  return (
    <div>
      <h2>Color Picker</h2>
      <HorizontalLayout>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <p>Selected: {color}</p>
        <div
          style={{
            width: "100px",
            height: "100px",
            background: color,
            borderRadius: "8px",
            border: "2px solid #ccc"
          }}
        />
      </HorizontalLayout>
    </div>
  );
};

function App() {
  const [offset, setOffset] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [mouseStart, setMouseStart] = useState(null);
  const cardWidth = 1920;
  const numCards = 3;
  const currentCard = Math.round(-offset / cardWidth);

  const navigateToCard = (index) => {
    setTransitioning(true);
    setOffset(-index * cardWidth);
    setTimeout(() => setTransitioning(false), 500);
  };

  const handleMouseDown = (e) => {
    const target = e.target;
    const isInteractive =
      target.tagName.toLowerCase() === "button" ||
      target.tagName.toLowerCase() === "input" ||
      target.closest("button") ||
      target.closest("input");

    if (isInteractive) return;

    setMouseStart({
      x: e.clientX,
      offset: offset
    });
    setSwiping(true);
    setTransitioning(false);
  };

  const handleMouseMove = (e) => {
    if (!mouseStart) return;

    const currentX = e.clientX;
    const diff = currentX - mouseStart.x;
    const newOffset = mouseStart.offset + diff;

    setOffset(Math.min(0, Math.max(-cardWidth * (numCards - 1), newOffset)));
  };

  const handleMouseUp = (e) => {
    if (!mouseStart) return;

    const diff = e.clientX - mouseStart.x;
    setSwiping(false);
    setTransitioning(true);

    // Simple threshold-based card change (15% of card width)
    const threshold = cardWidth * 0.15;
    let targetCard = currentCard;

    if (Math.abs(diff) > threshold) {
      targetCard = diff > 0 ? currentCard - 1 : currentCard + 1;
      targetCard = Math.max(0, Math.min(numCards - 1, targetCard));
    }

    setOffset(-targetCard * cardWidth);
    setMouseStart(null);
    setTimeout(() => setTransitioning(false), 500);
  };

  // Handle case where mouse leaves the window
  const handleMouseLeave = () => {
    if (mouseStart) {
      setSwiping(false);
      setMouseStart(null);
      setTransitioning(true);
      setOffset(-currentCard * cardWidth);
      setTimeout(() => setTransitioning(false), 500);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Page>
      <RefreshButton onClick={handleRefresh}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
        Refresh
      </RefreshButton>
      <CarouselContainer
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        $offset={offset}
        $transitioning={transitioning}
        $swiping={swiping}
      >
        <Card>
          <Counter />
        </Card>
        <Card>
          <TodoList />
        </Card>
        <Card>
          <ColorPicker />
        </Card>
      </CarouselContainer>
      <NavigationDots>
        {[...Array(numCards)].map((_, index) => (
          <Dot
            key={index}
            $active={currentCard === index}
            onClick={() => navigateToCard(index)}
          />
        ))}
      </NavigationDots>
    </Page>
  );
}

export default App;
