import { Card, CardContent, CircularProgress, List, ListItem, ListItemSecondaryAction, ListItemText, TextField } from "@material-ui/core"
import { Add, Delete, Done, Edit } from "@material-ui/icons"
import { Todo } from "@stator/models"
import React, { ChangeEvent, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { LoadingIconButton } from "../../loading-icon-button/loading-icon-button"
import { RootState } from "../../redux/root-reducer"
import { AppDispatch } from "../../redux/store"
import { TodosState, todosThunks } from "../../redux/thunks-slice/todos-thunks-slice"
import { useTodosPageStyles } from "./todos-page.styles"

interface Props {}

export const TodosPage: React.FC<Props> = () => {
  const classes = useTodosPageStyles()
  const dispatch = useDispatch<AppDispatch>()
  const todoState = useSelector<RootState, TodosState>((state: RootState) => state.todoReducer)
  const [todoCreateText, setTodoCreateText] = useState("")
  const [todoEditTextMap, setTodoEditTextMap] = useState(new Map<number, string>())
  const [todoEditIdMap, setTodoEditIdMap] = useState(new Map<number, boolean>())

  useEffect(() => {
    dispatch(todosThunks.getAll({}))
  }, [dispatch])

  useEffect(() => {
    setTodoEditTextMap(todoState.entities.reduce((container, todo) => ({ ...container, [todo.id]: todo.text }), new Map<number, string>()))
  }, [todoState.entities])

  const onTodoCreateChange = (event: ChangeEvent<HTMLInputElement>) => setTodoCreateText(event.target.value)

  const onTodoUpdateChange = (todo: Todo) => (event: ChangeEvent<HTMLInputElement>) => {
    return setTodoEditTextMap({ ...todoEditTextMap, [todo.id]: event.target.value })
  }

  const onTodoCreate = async () => {
    const response = await dispatch(todosThunks.create({ data: { text: todoCreateText } }))
    if (!response.type.includes("rejected")) {
      setTodoCreateText("")
    }
  }

  const onTodoEditClick = async (todo: Todo) => {
    if (todoEditIdMap[todo.id]) {
      await dispatch(todosThunks.update({ params: { id: todo.id }, data: { ...todo, text: todoEditTextMap[todo.id] } }))
      setTodoEditIdMap(todoEditIdMap => ({
        ...todoEditIdMap,
        [todo.id]: false,
      }))
    } else {
      setTodoEditIdMap(todoEditIdMap => ({
        ...todoEditIdMap,
        [todo.id]: true,
      }))
    }
  }

  const onTodoCreateKeyPress = () => async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      await onTodoCreate()
    }
  }

  const onTodoUpdateKeyPress = (todo: Todo) => async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      await onTodoEditClick(todo)
    }
  }

  return (
    <>
      <Card>
        <CardContent className={classes.addTodoContainer}>
          {!todoState.status.getAll.loading && (
            <>
              <TextField
                id="create-text-field"
                label="Todo"
                value={todoCreateText}
                onChange={onTodoCreateChange}
                onKeyPress={onTodoCreateKeyPress()}
              />
              <LoadingIconButton Icon={Add} onClick={onTodoCreate} loading={todoState.status.post.loading} />
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className={classes.cardContent}>
          {todoState.status.getAll.loading ? (
            <CircularProgress className={classes.getLoadingProgress} />
          ) : (
            <List>
              {todoState.entities.map(todo => (
                <ListItem key={todo.id}>
                  {todoEditIdMap[todo.id] && (
                    <TextField
                      placeholder="Todo"
                      value={todoEditTextMap[todo.id]}
                      onChange={onTodoUpdateChange(todo)}
                      onKeyPress={onTodoUpdateKeyPress(todo)}
                      className={classes.updateTextField}
                      data-testid="edit-text-field"
                      fullWidth
                    />
                  )}
                  {!todoEditIdMap[todo.id] && <ListItemText data-testid="todo-text" primary={todo.text} />}
                  <ListItemSecondaryAction className={classes.listItemSecondaryAction}>
                    <LoadingIconButton
                      className="edit-icon-button"
                      loading={todoState.status.put.ids[todo.id]}
                      Icon={todoEditIdMap[todo.id] ? Done : Edit}
                      onClick={() => onTodoEditClick(todo)}
                    />
                    <LoadingIconButton
                      className="delete-icon-button"
                      loading={todoState.status.delete.ids[todo.id]}
                      Icon={Delete}
                      onClick={() => dispatch(todosThunks.delete({ params: { id: todo.id } }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </>
  )
}
