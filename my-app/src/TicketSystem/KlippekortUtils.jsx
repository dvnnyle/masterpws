// Utility to expand klippekort into multiple 1-hour tickets
export function expandKlippekortTickets(items) {
  return items.flatMap(item => {
    if (item.category === "klippekort" && item.type === "stampCardTicket" && item.stampAmounts > 0) {
      return Array.from({ length: item.stampAmounts }).map((_, idx) => ({
        ...item,
        id: `${item.productId || item.orderReference || Math.random().toString(36).slice(2)}-stamp${idx+1}`,
        name: `${item.name} (klipp ${idx+1} av ${item.stampAmounts})`,
        duration: 60, // always 1 hour per ticket
        isStampTicket: true
      }));
    }
    return {
      ...item,
      id: item.productId || item.orderReference || Math.random().toString(36).slice(2),
    };
  });
}

// Utility to show klippekort as a single item (not split into 1-hour tickets)
export function klippekortAsSingleItems(items) {
  return items.map(item => {
    if (item.category === "klippekort" && item.type === "stampCardTicket" && item.stampAmounts > 0) {
      return {
        ...item,
        id: item.productId || item.orderReference || Math.random().toString(36).slice(2),
        name: `${item.name} (${item.stampAmounts} klipp igjen)`
      };
    }
    return {
      ...item,
      id: item.productId || item.orderReference || Math.random().toString(36).slice(2),
    };
  });
}
