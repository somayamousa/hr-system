<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with('employee')
            ->when($request->employee_id, fn($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->type, fn($q) => $q->where('type', $request->type));

        return response()->json($query->latest()->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:id_card,passport,cv,certificate,diploma,medical,insurance,tax,other',
            'file' => 'required|file|max:10240',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $path = $file->store("employees/documents/{$request->employee_id}", 'public');

        $document = Document::create([
            'employee_id' => $request->employee_id,
            'title' => $request->title,
            'type' => $request->type,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'expiry_date' => $request->expiry_date,
            'notes' => $request->notes,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($document->load('employee'), 201);
    }

    public function show(Document $document)
    {
        return response()->json($document->load('employee'));
    }

    public function update(Request $request, Document $document)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:id_card,passport,cv,certificate,diploma,medical,insurance,tax,other',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $document->update($validated);

        return response()->json($document);
    }

    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'تم حذف الوثيقة بنجاح']);
    }

    public function download(Document $document)
    {
        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }
}
