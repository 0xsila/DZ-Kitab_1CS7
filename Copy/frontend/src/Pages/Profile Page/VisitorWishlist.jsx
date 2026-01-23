function VisitorWishlist() {
  const availableBooks = [
    {
      id: 1,
      title: 'Le Seigneur des Anneaux - Tome 1',
      authors: 'J.R.R. Tolkien',
      isbn: '978-2-266-28626-8'
    },
    {
      id: 2,
      title: 'Harry Potter à l\'école des sorciers',
      authors: 'J.K. Rowling',
      isbn: '978-2-07-058462-8'
    }
  ]

  const pendingBooks = [
    {
      id: 3,
      title: 'Clean Code',
      authors: 'Robert C. Martin',
      isbn: '978-0-13-235088-4',
      dateAdded: '12/12/2025'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Livres disponibles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-blue-900">Livres disponibles</h2>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {availableBooks.length} trouvés
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {availableBooks.map((book) => (
              <div key={book.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{book.title}</h3>
                    <p className="text-gray-600 font-medium">{book.authors}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-400 select-none">ISBN</span>
                    {book.isbn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Livres en attente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-blue-900">Livres en attente</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pendingBooks.length} en recherche
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingBooks.map((book) => (
              <div key={book.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 group relative">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{book.title}</h3>
                  <span className="shrink-0 bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    En attente
                  </span>
                </div>
                
                <p className="text-gray-500 font-medium mb-4">{book.authors}</p>
                
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-sm text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-300 select-none">ISBN</span>
                    {book.isbn}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">Ajouté le {book.dateAdded}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitorWishlist
