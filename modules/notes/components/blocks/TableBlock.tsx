"use client";

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Table as TableIcon } from 'lucide-react';

interface TableBlockProps {
  content: string;
  placeholder?: string;
  isFocused: boolean;
  properties?: {
    rows?: number;
    columns?: number;
    data?: string[][];
    headers?: boolean;
  };
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const TableBlock = ({
  content,
  placeholder,
  isFocused,
  properties = {},
  onChange,
  onPropertyChange,
  onKeyDown,
  onFocus,
  onBlur
}: TableBlockProps) => {
  const rows = properties?.rows || 3;
  const columns = properties?.columns || 3;
  const data = properties?.data || Array(rows).fill(null).map(() => Array(columns).fill(''));
  const hasHeaders = properties?.headers ?? true;

  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const updateCell = (row: number, col: number, value: string) => {
    const newData = data.map((r: string[], i: number) =>
      i === row ? r.map((c: string, j: number) => j === col ? value : c) : r
    );
    onPropertyChange?.({
      rows,
      columns,
      data: newData,
      headers: hasHeaders
    });
  };

  const addRow = () => {
    const newRow = Array(columns).fill('');
    const newData = [...data, newRow];
    onPropertyChange?.({
      rows: rows + 1,
      columns,
      data: newData,
      headers: hasHeaders
    });
  };

  const addColumn = () => {
    const newData = data.map((row: string[]) => [...row, '']);
    onPropertyChange?.({
      rows,
      columns: columns + 1,
      data: newData,
      headers: hasHeaders
    });
  };

  const deleteRow = (rowIndex: number) => {
    if (rows <= 1) return; // Keep at least one row
    const newData = data.filter((_: any, i: number) => i !== rowIndex);
    onPropertyChange?.({
      rows: rows - 1,
      columns,
      data: newData,
      headers: hasHeaders
    });
  };

  const deleteColumn = (colIndex: number) => {
    if (columns <= 1) return; // Keep at least one column
    const newData = data.map((row: string[]) => row.filter((_: string, i: number) => i !== colIndex));
    onPropertyChange?.({
      rows,
      columns: columns - 1,
      data: newData,
      headers: hasHeaders
    });
  };

  const toggleHeaders = () => {
    onPropertyChange?.({ rows, columns, data, headers: !hasHeaders });
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      let nextRow = row;
      let nextCol = col;

      if (e.shiftKey) {
        // Move backward
        nextCol--;
        if (nextCol < 0) {
          nextCol = columns - 1;
          nextRow--;
          if (nextRow < 0) {
            nextRow = rows - 1;
          }
        }
      } else {
        // Move forward
        nextCol++;
        if (nextCol >= columns) {
          nextCol = 0;
          nextRow++;
          if (nextRow >= rows) {
            nextRow = 0;
          }
        }
      }

      const nextCell = cellRefs.current.get(`${nextRow}-${nextCol}`);
      if (nextCell) {
        nextCell.focus();
        nextCell.select();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next row, same column
      const nextRow = (row + 1) % rows;
      const nextCell = cellRefs.current.get(`${nextRow}-${col}`);
      if (nextCell) {
        nextCell.focus();
        nextCell.select();
      }
    } else if (e.key === 'ArrowUp' && row > 0) {
      e.preventDefault();
      const prevCell = cellRefs.current.get(`${row - 1}-${col}`);
      if (prevCell) prevCell.focus();
    } else if (e.key === 'ArrowDown' && row < rows - 1) {
      e.preventDefault();
      const nextCell = cellRefs.current.get(`${row + 1}-${col}`);
      if (nextCell) nextCell.focus();
    } else if (e.key === 'ArrowLeft' && col > 0 && (e.target as HTMLInputElement).selectionStart === 0) {
      e.preventDefault();
      const prevCell = cellRefs.current.get(`${row}-${col - 1}`);
      if (prevCell) prevCell.focus();
    } else if (e.key === 'ArrowRight' && col < columns - 1) {
      const input = e.target as HTMLInputElement;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        const nextCell = cellRefs.current.get(`${row}-${col + 1}`);
        if (nextCell) nextCell.focus();
      }
    }
  };

  return (
    <div className="group relative overflow-x-auto" onClick={onFocus}>
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse border border-border">
          <tbody>
            {data.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex} className="group/row">
                {row.map((cell: string, colIndex: number) => {
                  const isHeader = hasHeaders && rowIndex === 0;
                  const CellTag = isHeader ? 'th' : 'td';
                  const cellKey = `${rowIndex}-${colIndex}`;

                  return (
                    <CellTag
                      key={colIndex}
                      className={`relative border border-border p-0 ${isHeader ? 'bg-muted' : ''}`}
                    >
                      <input
                        ref={(el) => {
                          if (el) {
                            cellRefs.current.set(cellKey, el);
                          } else {
                            cellRefs.current.delete(cellKey);
                          }
                        }}
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, colIndex)}
                        onFocus={() => {
                          setFocusedCell({ row: rowIndex, col: colIndex });
                          onFocus();
                        }}
                        onBlur={onBlur}
                        placeholder={isHeader ? `Header ${colIndex + 1}` : `Cell ${rowIndex + 1},${colIndex + 1}`}
                        className={`w-full min-w-[120px] px-3 py-2 border-none outline-none bg-transparent placeholder:text-muted-foreground/30 ${isHeader ? 'font-semibold' : ''}`}
                      />

                      {/* Column delete button - show on hover for first row */}
                      {rowIndex === 0 && columns > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteColumn(colIndex);
                          }}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 opacity-0 group-hover:opacity-100 bg-background border border-border rounded hover:bg-destructive hover:text-destructive-foreground transition-all"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </CellTag>
                  );
                })}

                {/* Row delete button */}
                {rows > 1 && (
                  <td className="border-none p-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRow(rowIndex);
                      }}
                      className="ml-1 p-1 opacity-0 group-hover/row:opacity-100 bg-background border border-border rounded hover:bg-destructive hover:text-destructive-foreground transition-all"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Controls */}
        <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={addRow}
            className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 border border-border rounded hover:bg-muted transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Row
          </button>
          <button
            onClick={addColumn}
            className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 border border-border rounded hover:bg-muted transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Column
          </button>
          <button
            onClick={toggleHeaders}
            className={`px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted transition-colors ${hasHeaders ? 'bg-muted' : ''}`}
          >
            Headers {hasHeaders ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
};
