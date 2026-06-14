import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { fetchRegulations, updateReg, insertTicket, generateITAnalysis } from '@/lib/api';
import type { Regulation, ITTicket } from '@/types';

export function useRegulations() {
  const qc = useQueryClient();

  const { data: regulations = [], isLoading, error } = useQuery({
    queryKey: ['regulations'],
    queryFn: fetchRegulations,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Regulation> }) =>
      updateReg(id, fields),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: ['regulations'] });
      const prev = qc.getQueryData<Regulation[]>(['regulations']);
      qc.setQueryData<Regulation[]>(['regulations'], old =>
        old?.map(r => r.id === id ? { ...r, ...fields } : r) ?? []
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['regulations'], ctx.prev);
    },
  });

  const approveWithIT = useMutation({
    mutationFn: async (regulation: Regulation) => {
      const analysis = await generateITAnalysis(regulation);
      if (!analysis.requires_it_change) {
        await updateReg(regulation.id, { review_status: 'approved' });
        return { needsIT: false, regulation };
      }
      const ticket: ITTicket = {
        id: `tkt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        regulation_id: regulation.id,
        technical_spec: analysis.technical_spec,
        csharp_code: analysis.csharp_code ?? null,
        ai_prompt: analysis.ai_prompt ?? null,
        status: 'open',
        created_at: new Date().toISOString(),
      };
      await insertTicket(ticket);
      await updateReg(regulation.id, { review_status: 'approved_it' });
      return { needsIT: true, ticket, regulation };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['regulations'] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: Error) => {
      alert(`Failed to generate IT ticket: ${err.message}`);
    },
  });

  const unreviewed = regulations.filter(
    r => !['approved', 'approved_it'].includes(r.review_status)
  ).length;

  return { regulations, isLoading, error, updateStatus, approveWithIT, unreviewed };
}
