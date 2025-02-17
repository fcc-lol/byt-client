import React, { useState } from "react";
import { HorizontalLayout } from "../App";

export const TodoList = () => {
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
              borderRadius: "0.5rem",
              border: "0.0625rem solid #ccc"
            }}
          />
          <button onClick={addTodo}>Add Todo</button>
        </div>
      </HorizontalLayout>
    </div>
  );
};
