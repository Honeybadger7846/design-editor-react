import { useContext } from 'react';
import { EditorContext } from '../context';
export function useActiveObject() {
    const { activeObject } = useContext(EditorContext);
    return activeObject;
}