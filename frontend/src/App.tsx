import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FixedSizeList as List } from "react-window";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

const API = "/api";
const clientId = "test-client";
const perPageItems = 20;

export type Item = {
  id: number;
  value: string;
};

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  const listRef = useRef<any>(null);
  const isFetchingRef = useRef(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // Load initial items and selected state
  useEffect(() => {
    loadItems(true);

    axios.get(`${API}/state`, { params: { clientId } }).then((res) => {
      setCheckedIds(new Set(res.data.selected));
    });
  }, []);

  // Load items from the API
  const loadItems = useCallback(
    async (reset = false, searchValue = search) => {
      if (isFetchingRef.current) return;
      if (!hasMore && !reset) return;

      isFetchingRef.current = true;

      try {
        const res = await axios.get(`${API}/items`, {
          params: {
            offset: reset ? 0 : offset,
            limit: perPageItems,
            search: searchValue,
            clientId,
          },
        });

        const { items: loadedItems }: { items: Item[] } = res.data;

        setItems((prev) => (reset ? loadedItems : [...prev, ...loadedItems]));
        setOffset((prev) => (reset ? perPageItems : prev + perPageItems));
        setHasMore(loadedItems.length === perPageItems);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [offset, hasMore, search, clientId]
  );

  // Handle search with debounce
  const handleSearch = useCallback(
    (searchValue: string) => {
      setSearch(searchValue);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        setOffset(0);
        setHasMore(true);

        loadItems(true, searchValue);
      }, 300);
    },
    [loadItems]
  );

  const handleDragStart = async (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    setActiveId(null);

    // No change if the item is dropped in the same position
    if (active.id === over?.id) {
      return;
    }

    const oldIndex = items.findIndex((i) => i.id === +active.id);
    const newIndex = items.findIndex((i) => i.id === +over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    setItems(newItems);

    await axios.post(`${API}/order`, {
      clientId,
      order: newItems.map((i) => i.id),
    });
  };

  const handleCheck = async (
    index: number,
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newChecked = new Set(checkedIds);
    const uncheckedIds = [];

    if ((e.nativeEvent as MouseEvent).shiftKey && lastCheckedIndex !== null) {
      const [start, end] = [lastCheckedIndex, index].sort((a, b) => a - b);

      for (let i = start; i <= end; ++i) {
        if (e.target.checked) {
          newChecked.add(items[i].id);
        } else {
          newChecked.delete(items[i].id);
          uncheckedIds.push(items[i].id);
        }
      }
    } else {
      if (newChecked.has(id)) {
        newChecked.delete(id);
        uncheckedIds.push(id);
      } else {
        newChecked.add(id);
      }
    }

    await axios.post(`${API}/select`, {
      clientId,
      ids: e.target.checked ? [...newChecked] : uncheckedIds,
      selected: e.target.checked,
    });

    setLastCheckedIndex(index);
    setCheckedIds(newChecked);
  };

  const itemCount = hasMore ? items.length + 1 : items.length;

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    if (index === items.length) {
      loadItems();

      return <div style={style}>Loading...</div>;
    }

    const item = items[index];

    return (
      <div style={style}>
        <SortableItem
          id={item.id}
          value={item.value}
          checked={checkedIds.has(item.id)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleCheck(index, item.id, e)
          }
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto h-[95vh]">
      <div className="row">
        <div className="col"></div>
        <div className="col-6 p-4">
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 mb-4 w-full"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={[]} strategy={verticalListSortingStrategy}>
              <List
                height={600}
                itemCount={itemCount}
                itemSize={50}
                width={"100%"}
                ref={listRef}
              >
                {Row}
              </List>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <SortableItem
                  id={activeId}
                  value={items.find((i) => i.id === activeId)?.value || ""}
                  checked={checkedIds.has(activeId)}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
        <div className="col"></div>
      </div>
    </div>
  );
}

export default App;
