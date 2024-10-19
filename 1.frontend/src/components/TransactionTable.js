import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Pagination,
    CircularProgress,
    Paper,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; // Import the Search Icon

const TransactionTable = ({ selectedMonth }) => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');

    // Fetch transactions from the API
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            console.log(`Fetching transactions for ${selectedMonth}, page ${page}, perPage ${perPage}, search "${search}"`);
            const response = await axios.get(`http://localhost:5000/api/transactions`, {
                params: { month: selectedMonth, page, perPage, search }
            });
            setTransactions(response.data.transactions);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, selectedMonth, search]);

    return (
        <div>
            <TextField
                label="Search"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ marginBottom: '20px' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <TableContainer component={Paper} sx={{ marginTop: 2, borderRadius: 2, boxShadow: 3 }}>
                <Table sx={{ minWidth: 700, borderCollapse: 'collapse' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>S.No</TableCell>
                            <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                            <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>Sold</TableCell>
                            <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>Date of Sale</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} style={{ textAlign: 'center' }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <TableRow key={transaction._id}>
                                        <TableCell sx={{ border: '1px solid #ddd', textAlign: 'center' }}>
                                            {(page - 1) * perPage + index + 1}
                                        </TableCell>
                                        <TableCell sx={{ border: '1px solid #ddd' }}>{transaction.title}</TableCell>
                                        <TableCell sx={{ border: '1px solid #ddd' }}>{transaction.description}</TableCell>
                                        <TableCell sx={{ border: '1px solid #ddd' }}>${transaction.price}</TableCell>
                                        <TableCell sx={{ border: '1px solid #ddd' }}>{transaction.category}</TableCell>
                                        <TableCell sx={{ border: '1px solid #ddd' }}>{transaction.sold ? 'Yes' : 'No'}</TableCell>
                                        <TableCell sx={{ border: '1px solid #ddd' }}>{new Date(transaction.dateOfSale).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} style={{ textAlign: 'center' }}>
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <Pagination
                    count={Math.ceil(total / perPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                />
            </div>
        </div>
    );
};

export default TransactionTable;
