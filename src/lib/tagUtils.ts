export function addTag(tags: string[], newTag: string) {
  if (newTag.trim() && !tags.includes(newTag.trim())) {
    return [...tags, newTag.trim()];
  }
  return tags;
}

export function removeTag(tags: string[], tagToRemove: string) {
  return tags.filter((tag) => tag !== tagToRemove);
}

export function handleTagKeyPress(
  e: React.KeyboardEvent,
  addTagFn: () => void
) {
  if (e.key === "Enter") {
    e.preventDefault();
    addTagFn();
  }
}
