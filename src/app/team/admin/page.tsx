const handleDecision = async (ideaId: string, decision: 'Approved' | 'Rejected', wing: string = 'software') => {
    if (decision === 'Approved' && !wing) {
      alert('Please select a wing to allocate this to.');
      return;
    }

    // Use canonical 'Approved' or 'Rejected' rather than 'allocated'
    const statusValue = decision === 'Approved' ? 'Approved' : 'Rejected';

    const { error: ideaError } = await supabase
      .from('ideas')
      .update({
        status: statusValue,
        final_status: statusValue,
        allocated_wing: decision === 'Approved' ? wing : null,
      })
      .eq('id', ideaId);

    if (ideaError) { 
      alert('Error updating idea: ' + ideaError.message); 
      return; 
    }

    if (decision === 'Approved') {
      const idea = ideas.find((i) => i.id === ideaId);
      const { error: projError } = await supabase.from('projects').insert({
        idea_id: ideaId,
        name: idea?.title || 'New Collective Project',
        assigned_wing: wing,
        status: 'Building',
        sprint_directive: 'Initial sprint allocation authorized by Super Admin.',
      });

      if (projError) { 
        console.warn('Projects insert note:', projError.message);
      }
    }

    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    alert(`Idea successfully ${decision}!`);
  };
