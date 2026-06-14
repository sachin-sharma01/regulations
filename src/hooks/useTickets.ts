import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { fetchTickets, updateTicket } from '@/lib/api';
import type { ITTicket, TicketStatus } from '@/types';

export function useTickets() {
  const qc = useQueryClient();

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
  });

  const cycleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      updateTicket(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['tickets'] });
      const prev = qc.getQueryData<ITTicket[]>(['tickets']);
      qc.setQueryData<ITTicket[]>(['tickets'], old =>
        old?.map(t => t.id === id ? { ...t, status } : t) ?? []
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tickets'], ctx.prev);
    },
  });

  const openCount = tickets.filter(t => t.status === 'open').length;

  return { tickets, isLoading, error, cycleStatus, openCount };
}
