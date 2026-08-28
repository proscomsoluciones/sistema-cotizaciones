<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = in_array($request->integer('per_page'), [10, 25, 50, 100]) ? $request->integer('per_page') : 10;

        $clients = Client::query()
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->withCount('quotations')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('clientes/index', [
            'clients' => $clients,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('clientes/create');
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        Client::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente creado correctamente.']);

        return to_route('clientes.index');
    }

    public function show(Client $client): Response
    {
        $client->load(['quotations' => fn ($query) => $query->latest('issue_date')]);

        return Inertia::render('clientes/show', [
            'client' => $client,
        ]);
    }

    public function edit(Client $client): Response
    {
        return Inertia::render('clientes/edit', [
            'client' => $client,
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $client->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente actualizado correctamente.']);

        return to_route('clientes.index');
    }

    public function destroy(Client $client): RedirectResponse
    {
        if ($client->quotations()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No se puede eliminar un cliente con cotizaciones asociadas.']);

            return to_route('clientes.index');
        }

        $client->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente eliminado correctamente.']);

        return to_route('clientes.index');
    }
}
